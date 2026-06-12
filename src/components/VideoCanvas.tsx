import React, { useRef, useEffect, useState } from 'react';
import { useStore, THEME_CONFIGS, PRESET_AUDIO } from '../store';
import { getEasedProgress } from '../lib/easing';
import { Scene, DataRow, ThemeConfig } from '../types';
import { Play, Pause, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

export default function VideoCanvas() {
  const {
    scenes,
    activeSceneId,
    data,
    columns,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    projectSettings,
  } = useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [aspectError, setAspectError] = useState<string>('');

  // Find cumulative time milestones (e.g. Scene 1 = 0..10, Scene 2 = 10..18, etc.)
  let accumulatedTime = 0;
  const scenesWithMilestones = scenes.map((scene) => {
    const start = accumulatedTime;
    const end = start + scene.duration;
    accumulatedTime = end;
    return {
      ...scene,
      start,
      end,
    };
  });

  const totalDuration = accumulatedTime || 1;

  // Retrieve matching scene and its local time/progress
  const activeSceneInfo = scenesWithMilestones.find(
    (scene) => currentTime >= scene.start && currentTime <= scene.end
  ) || scenesWithMilestones[scenesWithMilestones.length - 1] || scenesWithMilestones[0];

  // Dynamic audio syncing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.volume = projectSettings.audioVolume;
      // Sync playhead
      if (Math.abs(audio.currentTime - (currentTime % (audio.duration || 100))) > 0.3) {
        audio.currentTime = currentTime % (audio.duration || 100);
      }
      audio.play().catch(() => {
        // Handle blocked autoplay gracefully
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTime, projectSettings.selectedAudioId, projectSettings.audioVolume]);

  // Redraw Canvas when any relevant state changes
  useEffect(() => {
    drawCanvas();
  }, [currentTime, activeSceneId, data, columns, projectSettings.aspectRatio, projectSettings.watermarkText, projectSettings.logoUrl, scenes]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!activeSceneInfo) {
      // Draw empty placeholder
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#71717a';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Please add a scene in the bottom timeline', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Determine target canvas resolutions based on aspect ratio
    let targetWidth = 1280;
    let targetHeight = 720; // Default 16:9

    if (projectSettings.aspectRatio === '9:16') {
      targetWidth = 720;
      targetHeight = 1280;
    } else if (projectSettings.aspectRatio === '1:1') {
      targetWidth = 1080;
      targetHeight = 1080;
    }

    // Assign canvas size physically
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    const { width, height } = canvas;

    // Get theme color configurations
    const theme = THEME_CONFIGS[activeSceneInfo.theme] || THEME_CONFIGS.light;

    // Clear and draw background
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, width, height);

    // Calculate progression inside active scene
    const sceneLocalTime = currentTime - activeSceneInfo.start;
    const sceneProgressRaw = Math.min(Math.max(sceneLocalTime / activeSceneInfo.duration, 0), 1);
    const progress = getEasedProgress(activeSceneInfo.easing, sceneProgressRaw);

    // Grid details
    const paddingLeft = width * 0.12;
    const paddingRight = width * 0.1;
    const paddingTop = height * 0.22;
    const paddingBottom = height * 0.18;
    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    // 1. Draw grid layout lines (if active)
    if (activeSceneInfo.showGridLines && !['pie', 'doughnut'].includes(activeSceneInfo.chartType)) {
      ctx.strokeStyle = theme.gridColor;
      ctx.lineWidth = 1.5;
      
      const gridCount = 5;
      for (let i = 0; i <= gridCount; i++) {
        const yCoord = paddingTop + (plotHeight / gridCount) * i;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, yCoord);
        ctx.lineTo(width - paddingRight, yCoord);
        ctx.stroke();
      }
    }

    // Extract values with dynamic fallback mapping
    let catCol = activeSceneInfo.categoryColumn;
    let valCol = activeSceneInfo.valueColumn;

    if (columns.length > 0) {
      const hasCat = columns.some((c) => c.name === catCol);
      const hasVal = columns.some((c) => c.name === valCol);

      if (!hasCat) {
        catCol = columns.find((c) => c.type === 'category' || c.type === 'date')?.name || columns[0]?.name || '';
      }
      if (!hasVal) {
        const numCols = columns.filter((c) => c.type === 'numeric');
        valCol = numCols[0]?.name || columns[1]?.name || columns[0]?.name || '';
      }
    }

    if (!catCol || !valCol || data.length === 0) {
      ctx.fillStyle = theme.textSecondary;
      ctx.font = '20px ' + theme.fontStack;
      ctx.textAlign = 'center';
      ctx.fillText('Variable column configuration is missing in settings', width / 2, height / 2);
      return;
    }

    // Determine active value columns (multi-series support), ensuring category column is excluded
    const rawCols = activeSceneInfo.valueColumns && activeSceneInfo.valueColumns.length > 0
      ? activeSceneInfo.valueColumns
      : [valCol];
    const activeValueCols = rawCols.filter(colName => colName !== catCol);
    if (activeValueCols.length === 0) {
      const fallbackVal = columns.find(c => c.type === 'numeric' && c.name !== catCol)?.name || valCol;
      activeValueCols.push(fallbackVal);
    }

    const getSeriesColor = (cIdx: number) => {
      if (cIdx === 0) return theme.primaryColor;
      if (cIdx === 1) return theme.secondaryColor;
      if (cIdx === 2) return theme.accentColor;
      const baseHues = [200, 45, 145, 310, 25];
      const hue = baseHues[(cIdx - 3) % baseHues.length] || 35;
      return `hsl(${hue}, 85%, 55%)`;
    };

    const labels = data.map((d) => String(d[catCol] || ''));
    const rawValues = data.map((d) => Number(d[valCol]) || 0);

    // Compute min / max scale dynamically across ALL selected columns to fit all curves/bars on canvas
    let allRawValues: number[] = [];
    activeValueCols.forEach((col) => {
      data.forEach((row) => {
        allRawValues.push(Number(row[col]) || 0);
      });
    });
    if (allRawValues.length === 0) allRawValues = [0];

    // Compute min / max for dynamic scales
    let maxVal = Math.max(...allRawValues, 10) * 1.15; // 15% headroom
    let minVal = 0;

    // If all values are positive, set bottom to 0, otherwise fit min
    const realMin = Math.min(...allRawValues, 0);
    if (realMin < 0) {
      minVal = realMin * 1.15;
    }

    // Filter values according to progressive drawing (Sequential Appearance)
    const totalDataPoints = data.length;
    const pointsToShow = Math.ceil(totalDataPoints * progress);
    const visibleRawValues = rawValues.slice(0, pointsToShow);

    // Helper to find peak for main highlighted annotation
    const highestValIndex = rawValues.indexOf(Math.max(...rawValues));

    // Draw Dynamic Color Legend Overlay for multi-series comparisons
    if (activeValueCols.length > 1 && !['pie', 'doughnut', 'timeline'].includes(activeSceneInfo.chartType)) {
      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = `600 ${Math.max(10, width * 0.012)}px ${theme.fontStack}`;
      
      let legendX = paddingLeft;
      const legendY = paddingTop * 0.76;
      
      activeValueCols.forEach((colName, cIdx) => {
        const dColor = getSeriesColor(cIdx);
        
        ctx.fillStyle = dColor;
        ctx.beginPath();
        ctx.arc(legendX + 6, legendY, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = theme.textPrimary;
        const displayName = colName.split(' Users')[0] || colName;
        ctx.fillText(displayName, legendX + 16, legendY);
        
        const textWidth = ctx.measureText(displayName).width;
        legendX += textWidth + 30;
      });
      ctx.restore();
    }

    // 2. Render selected chart type
    switch (activeSceneInfo.chartType) {
      case 'bar': {
        const barCount = data.length;
        const spacingRatio = 0.25; // 25% gap at category level
        const barWidth = plotWidth / barCount;
        const totalInnerWidth = barWidth * (1 - spacingRatio);
        const subBarCount = activeValueCols.length;
        const subBarWidth = totalInnerWidth / subBarCount;

        data.forEach((row, i) => {
          activeValueCols.forEach((colName, cIdx) => {
            const val = Number(row[colName]) || 0;
            // Apply progressive factor
            const factor = Math.max(0, Math.min(1, (progress * barCount) - i));
            const animVal = val * factor;

            const groupX = paddingLeft + barWidth * i + (barWidth * spacingRatio) / 2;
            const subBarX = groupX + subBarWidth * cIdx;

            const zeroY = paddingTop + plotHeight * (maxVal / (maxVal - minVal));
            const yVal = val >= 0 
              ? zeroY - (animVal / (maxVal - minVal)) * plotHeight 
              : zeroY + (Math.abs(animVal) / (maxVal - minVal)) * plotHeight;

            const isHighest = i === highestValIndex && activeSceneInfo.highlightHighest && cIdx === 0;
            const sColor = isHighest ? theme.accentColor : getSeriesColor(cIdx);
            
            ctx.fillStyle = sColor;
            ctx.beginPath();
            ctx.fillRect(subBarX, zeroY, subBarWidth - 1, yVal - zeroY);

            // Render value text label on top of bar (Fade-in labels)
            if (animVal !== 0 && factor > 0.5 && subBarWidth > 14) {
              ctx.fillStyle = theme.textPrimary;
              ctx.font = `bold ${Math.max(9, width * 0.012)}px ${theme.fontStack}`;
              ctx.textAlign = 'center';
              const labelY = val >= 0 ? yVal - 8 : yVal + 14;
              ctx.fillText(animVal.toFixed(1), subBarX + subBarWidth / 2, labelY);
            }
          });

          // X Category axis labels
          const groupCenterX = paddingLeft + barWidth * i + barWidth / 2;
          ctx.fillStyle = theme.textSecondary;
          ctx.font = `${Math.max(10, width * 0.012)}px ${theme.fontStack}`;
          ctx.textAlign = 'center';
          ctx.save();
          ctx.translate(groupCenterX, height - paddingBottom + 25);
          if (barCount > 8) {
            ctx.rotate(-Math.PI / 6);
          }
          ctx.fillText(labels[i], 0, 0);
          ctx.restore();
        });
        break;
      }

      case 'horizontal-bar': {
        const barCount = data.length;
        const spacingRatio = 0.25;
        const barHeight = plotHeight / barCount;
        const totalInnerHeight = barHeight * (1 - spacingRatio);
        const subBarCount = activeValueCols.length;
        const subBarHeight = totalInnerHeight / subBarCount;

        data.forEach((row, i) => {
          activeValueCols.forEach((colName, cIdx) => {
            const val = Number(row[colName]) || 0;
            const factor = Math.max(0, Math.min(1, (progress * barCount) - i));
            const animVal = val * factor;

            const groupY = paddingTop + barHeight * i + (barHeight * spacingRatio) / 2;
            const subBarY = groupY + subBarHeight * cIdx;
            const zeroX = paddingLeft;
            const targetWidth = (animVal / maxVal) * plotWidth;

            const isHighest = i === highestValIndex && activeSceneInfo.highlightHighest && cIdx === 0;
            const sColor = isHighest ? theme.accentColor : getSeriesColor(cIdx);
            
            ctx.fillStyle = sColor;
            ctx.fillRect(zeroX, subBarY, targetWidth, subBarHeight - 1);

            // Value and label rendering
            if (factor > 0.5 && subBarHeight > 10) {
              ctx.fillStyle = theme.textPrimary;
              ctx.font = `bold ${Math.max(10, width * 0.012)}px ${theme.fontStack}`;
              ctx.textAlign = 'left';
              ctx.fillText(animVal.toFixed(1), zeroX + targetWidth + 7, subBarY + subBarHeight / 2 + 3);
            }
          });

          ctx.fillStyle = theme.textSecondary;
          ctx.font = `${Math.max(10, width * 0.012)}px ${theme.fontStack}`;
          ctx.textAlign = 'right';
          ctx.fillText(labels[i], paddingLeft - 15, paddingTop + barHeight * i + barHeight / 2 + 4);
        });
        break;
      }

      case 'line':
      case 'animated-line':
      case 'area': {
        const pointCount = data.length;
        if (pointCount < 2) break;

        activeValueCols.forEach((colName, cIdx) => {
          const sColor = getSeriesColor(cIdx);
          ctx.strokeStyle = sColor;
          ctx.lineWidth = Math.max(3, width * 0.005);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const points: { x: number; y: number; val: number }[] = [];
          data.forEach((row, i) => {
            const val = Number(row[colName]) || 0;
            const pX = paddingLeft + (plotWidth / (pointCount - 1)) * i;
            const pY = height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * plotHeight;
            points.push({ x: pX, y: pY, val });
          });

          // Drawing progressive path line
          const partialDataLimit = progress * (pointCount - 1);
          const segmentIdx = Math.floor(partialDataLimit);
          const remainder = partialDataLimit - segmentIdx;

          ctx.beginPath();
          if (points[0]) ctx.moveTo(points[0].x, points[0].y);

          for (let i = 1; i <= segmentIdx; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }

          // Draw fractional line element
          if (segmentIdx < pointCount - 1 && remainder > 0) {
            const pCurrent = points[segmentIdx];
            const pNext = points[segmentIdx + 1];
            const interpX = pCurrent.x + (pNext.x - pCurrent.x) * remainder;
            const interpY = pCurrent.y + (pNext.y - pCurrent.y) * remainder;
            ctx.lineTo(interpX, interpY);
          }
          ctx.stroke();

          // If area chart, draw bottom gradients fill
          if (activeSceneInfo.chartType === 'area') {
            ctx.save();
            const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
            gradient.addColorStop(0, sColor + '3F'); // 25% opacity
            gradient.addColorStop(1, sColor + '00'); // 0% opacity
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.moveTo(points[0].x, height - paddingBottom);
            for (let i = 0; i <= segmentIdx; i++) {
              ctx.lineTo(points[i].x, points[i].y);
            }
            if (segmentIdx < pointCount - 1 && remainder > 0) {
              const pCurrent = points[segmentIdx];
              const pNext = points[segmentIdx + 1];
              const interpX = pCurrent.x + (pNext.x - pCurrent.x) * remainder;
              const interpY = pCurrent.y + (pNext.y - pCurrent.y) * remainder;
              ctx.lineTo(interpX, interpY);
            }
            ctx.lineTo(paddingLeft + (plotWidth / (pointCount - 1)) * partialDataLimit, height - paddingBottom);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          // Add visual point circles at nodes, highlighing highest node
          data.forEach((row, i) => {
            if (i > partialDataLimit) return;
            const p = points[i];
            const isHighest = i === highestValIndex && activeSceneInfo.highlightHighest && cIdx === 0;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, isHighest ? 6.5 : 3.5, 0, 2 * Math.PI);
            ctx.fillStyle = isHighest ? theme.accentColor : sColor;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Highlight values text for peak of primary series
            if (isHighest) {
              ctx.fillStyle = theme.textPrimary;
              ctx.font = `bold ${Math.max(10, width * 0.012)}px ${theme.fontStack}`;
              ctx.textAlign = 'center';
              ctx.fillText(`${p.val.toFixed(1)}`, p.x, p.y - 10);
            }
          });
        });

        // X Labels rendered once
        data.forEach((row, i) => {
          const skipFactor = Math.ceil(pointCount / 10); // avoids label overlapping
          if (i % skipFactor !== 0) return;
          const pX = paddingLeft + (plotWidth / (pointCount - 1)) * i;
          ctx.fillStyle = theme.textSecondary;
          ctx.font = `${Math.max(10, width * 0.011)}px ${theme.fontStack}`;
          ctx.textAlign = 'center';
          ctx.fillText(labels[i], pX, height - paddingBottom + 25);
        });
        break;
      }

      case 'pie':
      case 'doughnut': {
        const totalSum = rawValues.reduce((a, b) => a + b, 0) || 1;
        const centerX = width / 2;
        const centerY = paddingTop + plotHeight / 2;
        const radius = Math.min(plotWidth, plotHeight) * 0.44;

        let accumulatedAngle = -Math.PI / 2; // start from 12 o'clock

        // Render sections
        data.forEach((row, i) => {
          const val = Number(row[valCol]) || 0;
          const valRatio = val / totalSum;
          const sliceAngle = valRatio * 2 * Math.PI * progress; // animate total pie

          if (sliceAngle <= 0.001) return;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, accumulatedAngle, accumulatedAngle + sliceAngle);
          
          if (activeSceneInfo.chartType === 'doughnut') {
            ctx.arc(centerX, centerY, radius * 0.55, accumulatedAngle + sliceAngle, accumulatedAngle, true);
          } else {
            ctx.lineTo(centerX, centerY);
          }

          ctx.closePath();

          // Dynamic colors
          const hue = (i * (360 / data.length)) % 360;
          ctx.fillStyle = `hsla(${hue}, 70%, 55%, 0.9)`;
          ctx.fill();

          // Slice white border outline
          ctx.strokeStyle = theme.background;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw slice percentage text if big enough
          if (valRatio > 0.05 && progress > 0.4) {
            const labelAngle = accumulatedAngle + sliceAngle / 2;
            const labelRadius = radius * (activeSceneInfo.chartType === 'doughnut' ? 0.75 : 0.65);
            const textX = centerX + labelRadius * Math.cos(labelAngle);
            const textY = centerY + labelRadius * Math.sin(labelAngle);

            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.max(11, width * 0.013)}px ${theme.fontStack}`;
            ctx.textAlign = 'center';
            ctx.fillText(`${(valRatio * 100).toFixed(0)}%`, textX, textY);
          }

          accumulatedAngle += sliceAngle;
        });

        // If doughnut, center a gigantic count-up number of the cumulative total
        if (activeSceneInfo.chartType === 'doughnut' && progress > 0.1) {
          const targetNum = totalSum * progress;
          ctx.fillStyle = theme.textPrimary;
          ctx.font = `bold ${Math.max(22, width * 0.038)}px ${theme.fontStack}`;
          ctx.textAlign = 'center';
          ctx.fillText(targetNum.toFixed(1), centerX, centerY + 2);

          ctx.fillStyle = theme.textSecondary;
          ctx.font = `semibold ${Math.max(10, width * 0.012)}px ${theme.fontStack}`;
          ctx.fillText('TOTAL REACH', centerX, centerY - Math.max(24, width * 0.03));
        }
        break;
      }

      case 'scatter': {
        // Scatter plot bubbles
        data.forEach((row, i) => {
          const valY = Number(row[valCol]) || 0;
          const numCols = columns.filter((c) => c.type === 'numeric');
          const secondColName = numCols[2]?.name || numCols[0]?.name || valCol;
          const valX = Number(row[secondColName]) || i * 15;

          const xRangeMax = Math.max(...data.map((d) => Number(d[secondColName]) || 5), 10);
          
          const pX = paddingLeft + (valX / xRangeMax) * plotWidth * progress;
          const pY = height - paddingBottom - (valY / maxVal) * plotHeight * progress;

          ctx.fillStyle = i === highestValIndex && activeSceneInfo.highlightHighest ? theme.accentColor : theme.primaryColor;
          ctx.beginPath();
          ctx.arc(pX, pY, Math.max(6, width * 0.01), 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Labels
          ctx.fillStyle = theme.textPrimary;
          ctx.font = `${Math.max(9, width * 0.01)}px ${theme.fontStack}`;
          ctx.textAlign = 'center';
          ctx.fillText(labels[i], pX, pY - 12);
        });
        break;
      }

      case 'stacked-bars': {
        const barCount = data.length;
        const spacingRatio = 0.3;
        const barWidth = plotWidth / barCount;
        const innerBarWidth = barWidth * (1 - spacingRatio);

        data.forEach((row, i) => {
          let currentYOffset = 0;

          activeValueCols.forEach((colName, cIdx) => {
            const val = Number(row[colName]) || 0;
            const factor = Math.max(0, Math.min(1, (progress * barCount) - i));
            const animVal = val * factor;

            const barX = paddingLeft + barWidth * i + (barWidth * spacingRatio) / 2;
            const zeroY = height - paddingBottom;
            
            const colStackHeight = (animVal / maxVal) * plotHeight * 0.72;
            const startY = zeroY - currentYOffset;

            const sColor = getSeriesColor(cIdx);
            ctx.fillStyle = sColor;
            ctx.fillRect(barX, startY, innerBarWidth, -colStackHeight);

            currentYOffset += colStackHeight;
          });

          // X Category Labels
          const barX = paddingLeft + barWidth * i + (barWidth * spacingRatio) / 2;
          ctx.fillStyle = theme.textSecondary;
          ctx.font = `${Math.max(10, width * 0.011)}px ${theme.fontStack}`;
          ctx.textAlign = 'center';
          ctx.fillText(labels[i], barX + innerBarWidth / 2, height - paddingBottom + 25);
        });
        break;
      }

      case 'bubble': {
        data.forEach((row, i) => {
          const valY = Number(row[valCol]) || 0;
          const sizeVal = 15 + ((valY / maxVal) * 45); // Dynamic radius size

          const pX = paddingLeft + (plotWidth / data.length) * (i + 0.5);
          const pY = height - paddingBottom - (valY / maxVal) * plotHeight;

          // Grow size progressively
          const animRadius = sizeVal * progress;

          ctx.fillStyle = i === highestValIndex ? theme.accentColor + '99' : theme.primaryColor + '88';
          ctx.beginPath();
          ctx.arc(pX, pY, animRadius, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = theme.textPrimary;
          ctx.lineWidth = 1;
          ctx.stroke();

          if (progress > 0.4) {
            ctx.fillStyle = theme.textPrimary;
            ctx.font = `bold ${Math.max(10, width * 0.012)}px ${theme.fontStack}`;
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], pX, pY - 2);
            ctx.font = `${Math.max(9, width * 0.01)}px ${theme.fontStack}`;
            ctx.fillText(valY.toFixed(1), pX, pY + 10);
          }
        });
        break;
      }

      case 'bar-chart-race': {
        // Bar Chart Race! Show top elements sorted by value at current frame progress.
        // We can sort rows dynamically by value
        const sortedRaceRows = [...data].sort((a, b) => {
          return (Number(b[valCol]) || 0) - (Number(a[valCol]) || 0);
        });

        const topRaceLimit = Math.min(6, sortedRaceRows.length);
        const barHeight = plotHeight / topRaceLimit;
        const innerBarHeight = barHeight * 0.72;

        for (let i = 0; i < topRaceLimit; i++) {
          const row = sortedRaceRows[i];
          const val = Number(row[valCol]) || 0;
          const label = String(row[catCol] || '');

          const animatedVal = val * progress;
          const barWidthVal = (animatedVal / maxVal) * plotWidth;
          const barY = paddingTop + barHeight * i + (barHeight * 0.14);

          ctx.fillStyle = label === labels[highestValIndex] ? theme.accentColor : theme.primaryColor;
          ctx.fillRect(paddingLeft, barY, barWidthVal, innerBarHeight);

          // Name and value labels
          ctx.fillStyle = theme.textPrimary;
          ctx.font = `bold ${Math.max(11, width * 0.014)}px ${theme.fontStack}`;
          ctx.textAlign = 'left';
          ctx.fillText(`${label}: ${animatedVal.toFixed(1)}`, paddingLeft + 15, barY + innerBarHeight / 2 + 5);

          ctx.fillStyle = theme.textSecondary;
          ctx.font = `${Math.max(11, width * 0.012)}px ${theme.fontStack}`;
          ctx.textAlign = 'right';
          ctx.fillText(`#${i + 1}`, paddingLeft - 15, barY + innerBarHeight / 2 + 4);
        }
        break;
      }

      case 'timeline':
      default: {
        // Timeline style gigantic countdown/count-up focus summary slide (Example Scene 3)
        const totalSampleValue = rawValues[rawValues.length - 1] || 0;
        const speedMultiplierVal = totalSampleValue * progress;

        const centerX = width / 2;
        const centerY = height / 2;

        // Draw a giant counter center
        ctx.fillStyle = theme.accentColor;
        ctx.font = `900 ${Math.max(48, width * 0.08)}px ${theme.fontStack}`;
        ctx.textAlign = 'center';
        ctx.fillText(speedMultiplierVal.toFixed(2), centerX, centerY + 10);

        ctx.fillStyle = theme.textPrimary;
        ctx.font = `bold ${Math.max(16, width * 0.022)}px ${theme.fontStack}`;
        ctx.fillText(activeSceneInfo.sourceText || 'Total Record Target reached', centerX, centerY - Math.max(50, width * 0.075));

        ctx.fillStyle = theme.textSecondary;
        ctx.font = `italic ${Math.max(12, width * 0.016)}px ${theme.fontStack}`;
        ctx.fillText('Real-Time Animated Milestone Tracker', centerX, centerY + Math.max(52, width * 0.07));
        break;
      }
    }

    // 3. Render Title & Subtitle Overlay (Fade in based on local progress)
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Title text
    ctx.fillStyle = theme.textPrimary;
    ctx.font = `bold ${Math.max(16, width * 0.024)}px ${theme.fontStack}`;
    ctx.fillText(activeSceneInfo.title, paddingLeft, paddingTop * 0.28);

    // Subtitle text
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `${Math.max(12, width * 0.014)}px ${theme.fontStack}`;
    ctx.fillText(activeSceneInfo.subtitle, paddingLeft, paddingTop * 0.28 + Math.max(20, width * 0.026));
    ctx.restore();

    // 4. Footnotes & Source (at bottom)
    ctx.save();
    ctx.fillStyle = theme.textSecondary;
    ctx.font = `italic ${Math.max(10, width * 0.012)}px ${theme.fontStack}`;
    
    // Footnotes left
    ctx.textAlign = 'left';
    ctx.fillText(activeSceneInfo.footnotes, paddingLeft, height - paddingBottom * 0.58);

    // Source labels right
    ctx.textAlign = 'right';
    ctx.fillText(`Source: ${activeSceneInfo.sourceText}`, width - paddingRight, height - paddingBottom * 0.58);
    ctx.restore();

    // 5. Draw Custom Watermark text overlay (top right)
    ctx.fillStyle = theme.textSecondary + '66'; // 40% transparent
    ctx.font = `bold ${Math.max(12, width * 0.015)}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(projectSettings.watermarkText, width - paddingRight, paddingTop * 0.28);

    // 6. Draw Custom Logo overlay (from file base64) if uploaded
    if (projectSettings.logoUrl) {
      const img = new Image();
      img.onload = () => {
        // Draw image top center or corner
        const imgSize = Math.max(40, width * 0.06);
        ctx.drawImage(img, paddingLeft, paddingTop * 0.1, imgSize, imgSize);
      };
      img.src = projectSettings.logoUrl;
    }
  };

  const selectedAudio = PRESET_AUDIO.find((a) => a.id === projectSettings.selectedAudioId);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-zinc-900 border border-zinc-800 rounded-lg shadow-inner h-full flex-1 min-h-[400px]" id="rendering-stage">
      
      {/* Hidden audio element for synchronous music */}
      {selectedAudio && (
        <audio
          ref={audioRef}
          src={selectedAudio.url}
          loop
          className="hidden"
        />
      )}

      {/* Screen view aspect ratio frame */}
      <div className="relative border border-zinc-700 bg-black rounded-lg shadow-2xl flex items-center justify-center overflow-hidden max-w-full" style={{
        aspectRatio: projectSettings.aspectRatio === '16:9' ? '16/9' : projectSettings.aspectRatio === '9:16' ? '9/16' : '1/1',
        height: '420px',
      }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />

        {/* Floating preview badge overlays */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-zinc-950/80 backdrop-blur-md rounded text-[10px] font-mono text-indigo-400 font-bold tracking-widest uppercase border border-indigo-900">
          LIVE PREVIEW PROD-ENV
        </div>

        {/* Small floating aspect-ratio size indicators info */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-zinc-950/80 backdrop-blur-md rounded text-[10px] font-mono text-zinc-300 border border-zinc-800 uppercase">
          {projectSettings.aspectRatio} Frame
        </div>
      </div>

      {/* Quick Play Pause buttons directly below */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold shadow transition duration-200 ${
            isPlaying
              ? 'bg-amber-600 text-white hover:bg-amber-500'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
          id="canvas-play-trigger"
        >
          {isPlaying ? (
            <>
              <Pause size={14} /> Stop Timeline
            </>
          ) : (
            <>
              <Play size={14} /> Start Realtime Rendering
            </>
          )}
        </button>

        <button
          onClick={() => {
            setCurrentTime(0);
            setIsPlaying(false);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition"
          title="Restart video animation frame"
        >
          <RefreshCw size={14} /> Reset Frame
        </button>
      </div>
    </div>
  );
}
