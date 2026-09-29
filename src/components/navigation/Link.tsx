import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigateTo } from '../../app/navigation';
import { toHash, type RoutePath } from '../../app/routes';

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: RoutePath;
}

/** A real link (middle-click and "open in new tab" still work) with a gentle transition. */
export function Link({ to, onClick, ...rest }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateTo(to);
  };
  return <a href={toHash(to)} onClick={handleClick} {...rest} />;
}
