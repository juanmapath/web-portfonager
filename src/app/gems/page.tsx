import GemsDashboard from './GemsDashboard';

export const metadata = {
  title: 'Gems Finder · Quality Growth Scanner',
  description: 'Escaneo de activos infravalorados con análisis cuantitativo IA basado en Factor Investing.',
};

export default function GemsFinderPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Gems Finder</h1>
      <p className="text-gray-400">Escaneo de activos infravalorados basado en sentimiento y fundamentales.</p>

      <GemsDashboard />
    </div>
  );
}
