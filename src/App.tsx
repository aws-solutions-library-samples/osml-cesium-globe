import "./styles.css";

import { FC, ReactNode } from "react";
import { Viewer } from "resium";

import OsmlTray from "@/components/OsmlTray";
import { generateImageryProviders } from "@/util/imageryProviders";

/**
 * @component
 *
 * App is the main component of the application. It is responsible for rendering
 * the Viewer with appropriate imagery and terrain provider models. It also
 * includes an OsmlTray component inside the Viewer.
 *
 * @returns {React.Component} The rendered App component
 */
const App: FC = (): ReactNode => {
  return (
    <Viewer full imageryProviderViewModels={generateImageryProviders()}>
      <OsmlTray />
    </Viewer>
  );
};

export default App;
