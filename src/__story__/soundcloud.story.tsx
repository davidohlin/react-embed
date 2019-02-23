import * as React from 'react';
import {storiesOf} from '@storybook/react';
import Embed from '../lazy';

storiesOf('soundcloud', module)
  .add('Default', () => {
    return (
      <Embed url={'https://soundcloud.com/s1sh1/kravts-glupyy-molodoy-na-meli'} />
    );
  });