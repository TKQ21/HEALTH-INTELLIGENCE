const DiscoBackground = () => {
  return (
    <div className="disco-bg">
      <div
        className="disco-orb"
        style={{
          width: 400, height: 400,
          background: "radial-gradient(circle, hsl(183,100%,50%) 0%, transparent 70%)",
          top: "10%", left: "10%",
          animationDelay: "0s", animationDuration: "8s",
        }}
      />
      <div
        className="disco-orb"
        style={{
          width: 350, height: 350,
          background: "radial-gradient(circle, hsl(277,100%,50%) 0%, transparent 70%)",
          top: "50%", right: "5%",
          animationDelay: "2s", animationDuration: "10s",
        }}
      />
      <div
        className="disco-orb"
        style={{
          width: 300, height: 300,
          background: "radial-gradient(circle, hsl(330,100%,60%) 0%, transparent 70%)",
          bottom: "10%", left: "30%",
          animationDelay: "4s", animationDuration: "7s",
        }}
      />
      <div
        className="disco-orb"
        style={{
          width: 250, height: 250,
          background: "radial-gradient(circle, hsl(145,100%,50%) 0%, transparent 70%)",
          top: "30%", left: "50%",
          animationDelay: "1s", animationDuration: "9s",
        }}
      />
      <div
        className="disco-orb"
        style={{
          width: 200, height: 200,
          background: "radial-gradient(circle, hsl(50,100%,55%) 0%, transparent 70%)",
          bottom: "30%", right: "20%",
          animationDelay: "3s", animationDuration: "11s",
        }}
      />
      <div
        className="disco-orb"
        style={{
          width: 180, height: 180,
          background: "radial-gradient(circle, hsl(0,100%,55%) 0%, transparent 70%)",
          top: "70%", left: "5%",
          animationDelay: "5s", animationDuration: "12s",
        }}
      />
    </div>
  );
};

export default DiscoBackground;
