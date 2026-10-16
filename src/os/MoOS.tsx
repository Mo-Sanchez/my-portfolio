import { titleOf } from "./apps/registry";
import MobileShell from "./mobile/MobileShell";
import Desktop from "./shell/Desktop";
import Wallpaper from "./shell/Wallpaper";
import { useOS } from "./state/os";
import { OSProvider } from "./state/OSContext";
import "./styles/base.css";
import "./styles/shell.css";
import "./styles/apps.css";
import "./styles/mobile.css";

function Shell() {
  const { isMobile } = useOS();
  let ui = <Desktop />;
  if (isMobile) ui = <MobileShell />;
  return (
    <div className="moos">
      <Wallpaper />
      {ui}
    </div>
  );
}

export default function MoOS() {
  return (
    <OSProvider titleOf={titleOf}>
      <Shell />
    </OSProvider>
  );
}
