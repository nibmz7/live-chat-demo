import 'tailwindcss/base.css';
import 'tailwindcss/components.css';
import 'tailwindcss/utilities.css';

import { Outlet } from '@modern-js/runtime/router';

export default function Layout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
