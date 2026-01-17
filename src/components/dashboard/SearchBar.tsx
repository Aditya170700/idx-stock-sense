'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { analyzeTicker } from '@/app/actions/stock-actions';
import type { AnalysisResult } from '@/types/stock';

type ActionState = {
    success: boolean;
    data?: AnalysisResult;
    error?: string;
} | null;

/**
 * Submit button component with loading state
 */
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={`
        px-6 py-2 rounded-lg font-semibold text-white
        transition-all duration-200
        ${pending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }
        disabled:opacity-50
        flex items-center gap-2
      `}
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                </>
            ) : (
                'Analyze'
            )}
        </button>
    );
}

/**
 * SearchBar component with form to input ticker symbol
 */
export function SearchBar() {
    const [state, formAction] = useActionState<ActionState, FormData>(
        async (prevState: ActionState, formData: FormData) => {
            return await analyzeTicker(formData);
        },
        null
    );

    return (
        <form action={formAction} className="w-full max-w-2xl mx-auto">
            <div className="flex gap-3">
                <input
                    type="text"
                    name="ticker"
                    placeholder="Enter ticker symbol (e.g., BBCA)"
                    required
                    className="
            flex-1 px-4 py-2 rounded-lg border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            dark:bg-gray-800 dark:border-gray-600 dark:text-white
            text-lg
          "
                />
                <SubmitButton />
            </div>
            {state?.error && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {state.error}
                </div>
            )}
        </form>
    );
}
