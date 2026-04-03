import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter, Cell, ZAxis } from 'recharts';

const AssetComparison = ({ industryAssets, selectedTicker }) => {
    const [activeTab, setActiveTab] = useState('ROA');

    if (!industryAssets || Object.keys(industryAssets).length === 0) {
        return (
            <div className="p-4 text-center text-gray-500">
                No industry data available
            </div>
        );
    }

    const assetsArray = Object.values(industryAssets);

    // Metric configurations
    const metrics = {
        'ROA': { key: 'roa', label: 'ROA (%)', color: '#3b82f6' },
        'ROE': { key: 'roe', label: 'ROE (%)', color: '#10b981' },
        'OP.MARGIN': { key: 'oper_margin', label: 'Operating Margin (%)', color: '#f59e0b' },
        'P/E': { key: 'price_per_earnings', label: 'P/E Ratio', color: '#8b5cf6' },
        'P/FCF': { key: 'price_per_fcf', label: 'P/FCF Ratio', color: '#ec4899' }
    };

    // Prepare data for the active metric
    const prepareBarChartData = (metricKey) => {
        const data = assetsArray
            .map(asset => ({
                ticker: asset.ticker,
                value: parseFloat(asset[metricKey]) || 0,
                isSelected: asset.ticker === selectedTicker
            }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);

        return data;
    };

    // Calculate mean for the active metric
    const calculateMean = (data) => {
        if (data.length === 0) return 0;
        const sum = data.reduce((acc, item) => acc + item.value, 0);
        return sum / data.length;
    };

    // Prepare scatter plot data
    const prepareScatterData = () => {
        return assetsArray
            .map(asset => ({
                ticker: asset.ticker,
                roe: parseFloat(asset.roe) || 0,
                pfcf: parseFloat(asset.price_per_fcf) || 0,
                opMargin: parseFloat(asset.oper_margin) || 0,
                isSelected: asset.ticker === selectedTicker
            }))
            .filter(item => item.roe > 0 && item.pfcf > 0 && item.opMargin > 0);
    };

    const currentMetric = metrics[activeTab];
    const barChartData = prepareBarChartData(currentMetric.key);
    const meanValue = calculateMean(barChartData);
    const scatterData = prepareScatterData();

    return (
        <div className="w-full bg-gray-900 rounded-lg p-6 mt-4">
            <h3 className="text-xl font-bold text-white mb-4">
                Industry Comparison - {assetsArray[0]?.industry || 'N/A'}
            </h3>

            <div className="grid grid-cols-2 gap-6">
                {/* Left side - Bar charts with tabs */}
                <div className="bg-gray-800 rounded-lg p-4">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-4 border-b border-gray-700">
                        {Object.keys(metrics).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 font-semibold transition-colors ${activeTab === tab
                                    ? 'text-sky-400 border-b-2 border-sky-400'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Bar Chart */}
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barChartData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9ca3af" />
                                <YAxis dataKey="ticker" type="category" stroke="#9ca3af" width={50} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                                    labelStyle={{ color: '#fff' }}

                                />
                                <ReferenceLine
                                    x={meanValue}
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    label={{ value: `Mean: ${meanValue.toFixed(2)}`, fill: '#ef4444', position: 'top' }}
                                />
                                <Bar dataKey="value" name={currentMetric.label}>
                                    {barChartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.isSelected ? '#0ea5e9' : currentMetric.color}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right side - Scatter plot */}
                <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-4">
                        ROE vs P/FCF (Bubble size: Op. Margin)
                    </h4>
                    <div className="h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    type="number"
                                    dataKey="pfcf"
                                    name="P/FCF"
                                    stroke="#9ca3af"
                                    label={{ value: 'P/FCF', angle: 0, position: 'insideBottom', fill: '#9ca3af' }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="roe"
                                    name="ROE"
                                    stroke="#9ca3af"
                                    label={{ value: 'ROE (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                                />
                                <ZAxis type="number" dataKey="opMargin" range={[50, 400]} name="Op. Margin" />
                                <Tooltip
                                    cursor={{ strokeDasharray: '4 4' }}
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                                    labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}
                                    formatter={(value, name, props) => {
                                        if (name === 'ROE') return [`${value}%`, 'ROE'];
                                        if (name === 'P/FCF') return [value, 'P/FCF'];
                                        if (name === 'Op. Margin') return [`${value}%`, 'Op. Margin'];
                                        return [value, name];
                                    }}
                                    labelFormatter={() => ''}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-gray-800 border border-gray-700 p-3 rounded shadow-lg">
                                                    <p className="text-white font-bold mb-2">{data.ticker}</p>
                                                    <p className="text-sky-400 text-sm">ROE: {data.roe}%</p>
                                                    <p className="text-pink-400 text-sm">P/FCF: {data.pfcf}</p>
                                                    <p className="text-yellow-400 text-sm">Op. Margin: {data.opMargin}%</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter name="Assets" data={scatterData}>
                                    {scatterData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.isSelected ? '#0ea5e9' : '#8b5cf6'}
                                            stroke={entry.isSelected ? '#fff' : 'none'}
                                            strokeWidth={entry.isSelected ? 2 : 0}
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetComparison;
