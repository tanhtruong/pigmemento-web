const Dashboard = () => {
  const today = new Date().toLocaleDateString();

  return (
    <div className="py-6 space-y-6 text-left">
      <header>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">Today is {today}</p>
      </header>

      <section className="grid grid-cols-2 gap-5"></section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold"></h2>
      </section>
    </div>
  );
};

export default Dashboard;
