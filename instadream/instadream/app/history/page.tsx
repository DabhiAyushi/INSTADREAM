import { GenerationHistory } from '@/components/generator/generation-history';

export default function HistoryPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <GenerationHistory />
      </div>
    </div>
  );
}
