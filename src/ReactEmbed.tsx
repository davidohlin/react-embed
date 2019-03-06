import * as React from 'react';
import defaultRouter from './routeToBlock';
import defaultRender from './renderer';

const IS_BROWSER = typeof window === 'object';

export interface ParsedUrl {
  url: string;
  hostname: string;
  pathname: string;
  search: string;
  hash: string;
}

export type EmbedBlockId = string;
export interface BlockProps extends ParsedUrl {
  id: EmbedBlockId;
  renderVoid: (error?: Error) => React.ReactElement<any> | null;
}

export interface Blocks {
  [name: string]: React.ComponentType<BlockProps>;
}

const defaultBlocks: Blocks = {
  figma: React.lazy(() => import('./blocks/figma')),
  gist: React.lazy(() => import('./blocks/gist')),
  gmaps: React.lazy(() => import('./blocks/gmaps')),
  imgur: React.lazy(() => import('./blocks/imgur')),
  instagram: React.lazy(() => import('./blocks/instagram')),
  jsfiddle: React.lazy(() => import('./blocks/jsfiddle')),
  reactPlayer: React.lazy(() => import('./blocks/react-player')),
  replit: React.lazy(() => import('./blocks/replit')),
  soundcloud: React.lazy(() => import('./blocks/soundcloud')),
  tweet: React.lazy(() => import('./blocks/tweet')),
  youtube: React.lazy(() => import('./blocks/youtube')),
  gfycat: React.lazy(() => import('./blocks/gfycat')),
};

export type ReactEmbedRouterResult = undefined | [undefined | React.ComponentType<BlockProps>, EmbedBlockId];
export type ReactEmbedRouter = (blocks: Blocks, url: ParsedUrl) => ReactEmbedRouterResult;
export type ReactEmbedRenderer = (block: React.ComponentType<BlockProps>, id: EmbedBlockId, props: ReactEmbedProps, state: ReactEmbedState) => React.ReactElement<any> | null;
export type ReactEmbedVoidRenderer = (props: ReactEmbedProps, state: ReactEmbedState, error?: Error) => React.ReactElement<any> | null;

const renderNull = () => null;

export interface ReactEmbedProps {
  url: string;
  blocks?: Blocks;
  router?: ReactEmbedRouter;
  render?: ReactEmbedRenderer;
  renderLoading?: ReactEmbedRenderer;
  /**
   * Called on error or when `react-embed` does not know how render a URL.
   * If called on on error, error will available in `error` argument.
   */
  renderVoid?: ReactEmbedVoidRenderer;
}

export interface ReactEmbedState {
  url?: ParsedUrl;
  error?: Error;
}

export class ReactEmbed extends React.PureComponent<ReactEmbedProps, ReactEmbedState> {
  static defaultProps = {
    blocks: defaultBlocks,
    router: defaultRouter,
    render: defaultRender,
    renderLoading: renderNull,
    renderVoid: renderNull,
  };

  static getDerivedStateFromProps (props) {
    if (!IS_BROWSER) return null;

    if (typeof props.url === 'string') {
      try {
        const url = new URL(props.url);
        const {hostname, pathname, search, hash} = url;
        return {
          url: {
            url: props.url,
            hostname,
            pathname,
            search,
            hash,
          },
        };
      } catch (error) {
        return {error};
      }
    } else {
      return undefined;
    }
  }

  state: ReactEmbedState = {};

  url: undefined | ParsedUrl;

  render () {
    if (!IS_BROWSER) return null;

    const {props, state} = this;

    if (state.error) return props.renderVoid!(props, state, state.error);

    let result: ReactEmbedRouterResult
    try {
      result = props.router!(props.blocks!, state.url!);
    } catch (error) {
      // NOTE: This should never happen (hopefully).
      // tslint:disable-next-line no-console
      console.error('Could not route block:', error);
      return props.renderVoid!(props, state, error);
    }

    if (!result || !result[0]) return props.renderVoid!(props, state);

    const [Block, id] = result as any;
    return props.render!(Block, id, props, state);
  }
}

export default ReactEmbed;
