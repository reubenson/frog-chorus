export function longpress(node, threshold = 500) {
  const down = (event) => {
    console.log('event', event);
    // event.preventDefault();
    const timeout = setTimeout(() => {
      node.dispatchEvent(new CustomEvent('longpress'));
    }, threshold);

    const cancel = (event) => {
      console.log('event', event);
      console.log('cancelling timeout');
      clearTimeout(timeout);
      node.removeEventListener('mousemove', cancel);
      node.removeEventListener('mouseup', cancel);
      node.removeEventListener('ontouchend', cancel);
    }

    node.addEventListener('mousemove', cancel);
    node.addEventListener('mouseup', cancel);
    node.addEventListener('ontouchend', cancel);
  }

  node.addEventListener('mousedown', down);
  node.addEventListener('touchstart', down);

  // allow mobile long-press
  const preventDefault = e => {
    console.log('e', e);
    // e.preventDefault();
  };
  node.addEventListener('touchend', preventDefault);
  node.addEventListener('touchmove', preventDefault);
  node.addEventListener('touchcancel', preventDefault);

  return {
    destroy() {
      console.log('in destroy');
      node.removeEventListener('mousedown', down);
      node.removeEventListener('touchstart', down);
    }
  }
}