import React, { Component, PropTypes } from 'react';
import { timer } from 'd3-timer';
import { interpolateNumber, interpolateTransformSvg } from 'd3-interpolate';
import { format } from 'd3-format';

const duration = 1500;
const percentFormat = format('.2%');

export class Bar extends Component {

  componentDidMount() {
    this.isMounting(this.props, this.refs);
  }

  isMounting(props, refs) {
    let {node, rect, text} = refs;
    let {node: {yVal, size: [w, h]}} = props;

    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    text.setAttribute('x', w - 3);

    let interp0 = interpolateTransformSvg('translate(0,500)', `translate(0,${yVal})`);
    let interp1 = interpolateNumber(1e-6, 1);

    this.transition = timer(elapsed => {
      let t = elapsed < duration ? (elapsed / duration): 1;
      node.setAttribute('transform', interp0(t));
      node.setAttribute('opacity', interp1(t));
      if (t === 1) {
        this.transition.stop();
      }
    });
  }

  isUpating(props, next, refs) {
    let {node: {yVal, size: [w, h]}} = props;

    let interp0 = interpolateTransformSvg(`translate(0,${yVal})`, `translate(0,${next.node.yVal})`);
    let interp1 = interpolateNumber(w, next.node.size[0]);
    let interp2 = interpolateNumber(h, next.node.size[1]);
    let interp3 = interpolateNumber(w - 3, next.node.size[0] - 3);

    refs.node.setAttribute('opacity', 1);

    this.transition = timer(elapsed => {
      let t = elapsed < duration ? (elapsed / duration): 1;
      refs.node.setAttribute('transform', interp0(t));
      refs.rect.setAttribute('width', interp1(t));
      refs.rect.setAttribute('height', interp2(t));
      refs.text.setAttribute('x', interp3(t));
      if (t === 1) {
        this.transition.stop();
      }
    });
  }

  isRemoving(props, refs) {
    let {node: {yVal, udid}, removeNode} = props;

    let interp0 = interpolateTransformSvg(`translate(0,${yVal})`, 'translate(0,500)');
    let interp1 = interpolateNumber(1, 1e-6);

    this.transition = timer(elapsed => {
      let t = elapsed < duration ? (elapsed / duration): 1;
      refs.node.setAttribute('transform', interp0(t));
      refs.node.setAttribute('opacity', interp1(t));
      if (t === 1) {
        this.transition.stop();
        removeNode(udid);
      }
    });
  }

  componentWillReceiveProps(next) {
    let { props, refs } = this;

    this.transition.stop();

    if (next.node.type === 'MOUNTING') {
      this.isMounting(next, refs);
    } else if (next.node.type === 'UPDATING') {
      this.isUpating(props, next, refs);
    } else if (next.node.type === 'REMOVING') {
      this.isRemoving(props, refs);
    } else {
      throw new Error('Invalid Node Type');
    }
  }

  componentWillUnmount() {
    this.transition.stop();
  }

  render() {
    let {xScale, node: { udid, size, xVal }} = this.props;

    return (
      <g ref='node' opacity={1e-6}>
        <rect
          ref='rect'
          className='bar'
          opacity={0.5}
          fill='#0097a7'
        />
        <text
          fontSize={'10px'}
          fill='white'
          dy='0.35em'
          x={-20}
          y={size[1] / 2}
        >{udid}</text>
        <text
          ref='text'
          fontSize={'10px'}
          textAnchor='end'
          fill='white'
          dy='0.35em'
          y={size[1] / 2}
        >{percentFormat(xScale.invert(xVal))}</text>
      </g>
    );
  }
}

Bar.propTypes = {
  node: PropTypes.object.isRequired,
  xScale: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired
};
