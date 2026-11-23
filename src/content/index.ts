import { render, h } from 'preact';
import { App } from '../ui/App';
import { styles } from '../ui/styles';

const HOST_ID = 'tl-support-root';

export function mount(doc: Document = document) {
  if (doc.getElementById(HOST_ID)) return;
  const host = doc.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });
  const style = doc.createElement('style');
  style.textContent = styles;
  const container = doc.createElement('div');
  shadow.append(style, container);
  doc.body.append(host);
  render(h(App, null), container);
}

mount();
