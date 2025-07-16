interface IProps {
  children: React.ReactNode;
  identifier: string;
  className?: string; // << THÊM DÒNG NÀY
}

const SimpleGlowCard = ({ children, identifier, className }: IProps) => {
  return (
    <div
      className={`simple-glow-container simple-glow-container-${identifier}`}
    >
      <article
        className={`simple-glow-card simple-glow-card-${identifier} ${className || ""}`}
      >
        {children}
      </article>
    </div>
  );
};

export default SimpleGlowCard;
