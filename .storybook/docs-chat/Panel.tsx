import React, { useRef, useState } from 'react';
import { AddonPanel } from 'storybook/internal/components';
import type { KitInput } from '../../src/components/input/input.component.js';
import { ask, type AskResponse } from './ask.js';

// Registers kit-input / kit-button / kit-icon in the manager window. Pre-built by
// build-kit.mjs: importing Kit source here breaks under the manager's esbuild config.
import './kit.generated.js';
import '../../src/styles/variables.css';
import './panel.css';

type Status =
	| { state: 'idle' }
	| { state: 'loading' }
	| { state: 'error'; message: string };

export function DocsChatPanel({ active }: { active?: boolean }) {
	const inputRef = useRef<KitInput>(null);
	const [status, setStatus] = useState<Status>({ state: 'idle' });
	const [result, setResult] = useState<AskResponse | null>(null);
	const loading = status.state === 'loading';

	async function submit() {
		const input = inputRef.current;
		if (!input || loading) return;
		if (!input.reportValidity()) return;
		const question = input.value.trim();
		if (!question) return;

		setResult(null);
		setStatus({ state: 'loading' });
		try {
			setResult(await ask(question));
			setStatus({ state: 'idle' });
		} catch (err) {
			setStatus({ state: 'error', message: (err as Error).message });
		}
	}

	return (
		<AddonPanel active={active ?? false}>
			<div className="kit-docs-chat">
				<kit-input
					ref={inputRef}
					label="Question"
					placeholder="e.g. How do I theme kit-button?"
					required
					onKeyDown={(event: React.KeyboardEvent) => {
						if (event.key === 'Enter') submit();
					}}
				></kit-input>
				{/* React 18 (the manager's React) sets custom-element props as attributes, so
				    `disabled={false}` would become disabled="false" and read as true. */}
				<kit-button disabled={loading || undefined} onClick={submit}>
					Ask
					<kit-icon name="arrow-right" size="small"></kit-icon>
				</kit-button>

				<div
					role="status"
					aria-live="polite"
					className={status.state === 'error' ? 'status error' : 'status'}
				>
					{status.state === 'loading' && 'Thinking...'}
					{status.state === 'error' && status.message}
				</div>

				{result && (
					<div>
						<div className="answer">{result.answer}</div>
						{result.sources?.length > 0 && (
							<div className="sources">
								<strong>Sources</strong>
								<ul>
									{result.sources.map(({ source, similarity }) => (
										<li key={source}>
											{typeof similarity === 'number'
												? `${source} (${similarity.toFixed(3)})`
												: source}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}
			</div>
		</AddonPanel>
	);
}

declare module 'react' {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace JSX {
		interface IntrinsicElements {
			'kit-input': React.DetailedHTMLProps<React.HTMLAttributes<KitInput>, KitInput> & {
				label?: string;
				placeholder?: string;
				required?: boolean;
			};
			'kit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
				disabled?: boolean;
			};
			'kit-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
				name?: string;
				size?: string;
			};
		}
	}
}
