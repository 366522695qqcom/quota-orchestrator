import React, { useEffect, useRef } from 'react';

interface UsageChartProps {
  data: Array<{ date: string; value: number }>;
  label: string;
  color?: string;
}

export function UsageChart({ data, label, color = '#6366f1' }: UsageChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const minValue = 0;

    const xStep = chartWidth / (data.length - 1);
    const yRatio = chartHeight / (maxValue - minValue);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding + index * xStep;
      const y = height - padding - (point.value - minValue) * yRatio;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    ctx.fillStyle = color + '33';
    data.forEach((point, index) => {
      const x = padding + index * xStep;
      const y = height - padding - (point.value - minValue) * yRatio;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    for (let i = 0; i <= 4; i++) {
      const value = minValue + (maxValue - minValue) * (i / 4);
      const y = height - padding - (value - minValue) * yRatio;
      ctx.fillText(value.toString(), padding - 10, y);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';

    data.forEach((point, index) => {
      if (index % Math.ceil(data.length / 5) === 0) {
        const x = padding + index * xStep;
        const date = new Date(point.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
        ctx.fillText(date, x - 20, height - 10);
      }
    });

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, width / 2, 20);

  }, [data, color]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="w-full h-auto"
      />
    </div>
  );
}