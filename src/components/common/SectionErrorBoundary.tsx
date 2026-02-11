import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  sectionName: string;
};

type State = {
  hasError: boolean;
};

export class SectionErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[SectionErrorBoundary] ${this.props.sectionName} render failed`, error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100">
          <p className="inline-flex items-center gap-2 font-semibold">
            <AlertTriangle size={18} />
            {this.props.sectionName} 目前無法顯示
          </p>
          <p className="text-sm">已攔截此 Section 的渲染錯誤，避免整頁白屏。請按章節切換鍵重試或重新整理頁面。</p>
        </section>
      );
    }

    return this.props.children;
  }
}
