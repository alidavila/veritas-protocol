
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center font-mono">
                    <h1 className="text-2xl text-red-500 mb-4">¡Algo salió mal!</h1>
                    <div className="bg-zinc-900 p-6 rounded border border-red-900/50 max-w-2xl w-full">
                        <p className="text-zinc-400 mb-2">Error detectado:</p>
                        <code className="block bg-black p-4 rounded text-red-400 text-sm overflow-auto mb-4">
                            {this.state.error?.toString()}
                        </code>
                        <p className="text-zinc-500 text-xs">
                            Si estás usando traducción automática en el navegador, por favor desactívala ya que puede causar conflictos con la aplicación.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded transition-colors"
                        >
                            Recargar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
