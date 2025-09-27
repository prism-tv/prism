import { render } from 'solid-js/web';
import { hello } from '@prism-tv/core';

const App = () => <div style="font: 600 18px system-ui; padding: 16px;">{hello()}</div>;

render(() => <App />, document.getElementById('app')!);
