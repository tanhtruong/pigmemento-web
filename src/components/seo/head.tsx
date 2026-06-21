import { Helmet } from '@dr.pogodin/react-helmet';

type HeadProps = {
  title?: string;
  description?: string;
  /** Emit `<meta name="robots" content="noindex">` — for unlisted routes
   *  (e.g. the temporary `/next` landing) that must stay out of search. */
  noindex?: boolean;
};

export const Head = ({
  title = '',
  description = '',
  noindex = false,
}: HeadProps = {}) => {
  return (
    <Helmet
      title={title ? `${title} | Pigmemento` : undefined}
      defaultTitle="pigmemento"
    >
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
};
