import * as React from 'react';
import {ReactEmbedRenderer} from '.';

const renderer: ReactEmbedRenderer = (Block: any, id, props, state) => {
  return (
    <React.Suspense fallback={props.renderLoading!}>
      <Block {...state.url} id={id} />
    </React.Suspense>
  );
};

export default renderer;