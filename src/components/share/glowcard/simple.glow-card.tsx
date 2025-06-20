interface IProps {
  children: React.ReactNode;
  identifier: string;
}

const SimpleGlowCard = ({ children, identifier }: IProps) => {
  return (
    <div
      className={`simple-glow-container simple-glow-container-${identifier}`}
    >
      <article className={`simple-glow-card simple-glow-card-${identifier}`}>
        {children}
      </article>
    </div>
  );
};

export default SimpleGlowCard;
