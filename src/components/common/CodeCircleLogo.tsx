import { Link } from 'react-router-dom';

type CodeCircleLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  asLink?: boolean;
};

export default function CodeCircleLogo({
  className = '',
  iconClassName = 'text-xl',
  textClassName = 'tracking-wide',
  asLink = false,
}: CodeCircleLogoProps) {
  const content = (
    <>
      <span className={iconClassName}>{'</>'}</span>
      <span className={textClassName}>CODECIRCLE</span>
    </>
  );

  if (asLink) {
    return (
      <Link to="/" className={`inline-flex items-center gap-2 font-semibold ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 font-semibold ${className}`}>
      {content}
    </div>
  );
}
