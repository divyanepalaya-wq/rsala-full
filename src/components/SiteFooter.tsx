const SiteFooter = () => {
  return (
    <footer className="bg-foreground py-12">
      <div className="container mx-auto px-6 text-center">
        <p className="text-2xl font-bold tracking-tight text-primary-foreground mb-2">
          r-<span className="text-primary">sala</span>
        </p>
        <p className="text-sm text-primary-foreground/60 mb-6">
          A Space for Sound, Story, and Spirit.
        </p>
        <div className="border-t border-primary-foreground/10 pt-6">
          <p className="text-xs text-primary-foreground/40">
            Managed by <span className="font-semibold text-primary-foreground/60">Nepa-laya</span> · Kathmandu, Nepal
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
