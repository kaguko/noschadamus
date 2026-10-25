import { notFound } from 'next/navigation';
import { DevUi } from './dev-ui';

export const metadata = { title: 'UI kit', robots: { index: false } };

export default function DevUiPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <DevUi />;
}
