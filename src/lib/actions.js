export function longpress (node, threshold = 500) {
  const down = () => {
    const timeout = setTimeout(() => {
      node.dispatchEvent(new CustomEvent('longpress'))
    }, threshold)

    const cancel = () => {
      clearTimeout(timeout)
      node.removeEventListener('mousemove', cancel)
      node.removeEventListener('mouseup', cancel)
      node.removeEventListener('touchend', cancel)
    }

    node.addEventListener('mousemove', cancel)
    node.addEventListener('mouseup', cancel)
    node.addEventListener('touchend', cancel)
  }

  node.addEventListener('mousedown', down)
  node.addEventListener('touchstart', down)

  return {
    destroy () {
      node.removeEventListener('mousedown', down)
      node.removeEventListener('touchstart', down)
    }
  }
}
