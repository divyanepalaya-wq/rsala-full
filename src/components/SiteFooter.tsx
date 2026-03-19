import logo from "@/assets/r-sala-logo.png";

const SiteFooter = () => {
  return (
    <footer className="bg-foreground py-12">
      <div className="container mx-auto px-6 text-center">
        <img src={logo} alt="r-sala logo" className="h-14 w-auto mx-auto mb-2" />
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
