import { Header } from "@components/layout/Header";
import { Sidebar } from "@components/layout/Sidebar";
import { ContentNavigation, ContentRegion } from "./ContentNavigation";
import styles from "./AppFrame.styles";

interface AppFrameProps {
  children: React.ReactNode;
}

export const AppFrame = ({ children }: AppFrameProps) => {
  return (
    <div className={styles.frame}>
      <Header />
      <ContentNavigation>
        <div className={styles.body}>
          <Sidebar />
          <ContentRegion>{children}</ContentRegion>
        </div>
      </ContentNavigation>
    </div>
  );
};
