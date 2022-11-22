

import {
  Route,
  BrowserRouter,
  Routes,
} from "react-router-dom";
import { BreakPoints } from './context';
import { useMediaQuery } from "react-responsive";
import routes from './routes';
import { Neo4jProvider, createDriver } from 'use-neo4j'

const driver = createDriver('neo4j+s',
    'e3f1202f.databases.neo4j.io', 
    7687, 
    'neo4j', 
    'Mh-OR7IPlBwdxPSV-vGCwYz7uGodO347ICK5_Pe8_to')

function App() {
  const breakpoints = {
    lg: useMediaQuery({ query: '(min-width: 992px)' }),
    md: useMediaQuery({ query: '(min-width: 768px)' }),
    sm: useMediaQuery({ query: '(min-width: 576px)' })
  }
  return (
    <BreakPoints.Provider value={breakpoints}>
    <Neo4jProvider driver={driver}>
    <div>
      <BrowserRouter>
      <Routes>
      {
        routes.map(route => (
          <Route path={route.href} exact element={<route.component/>} key={route.name}></Route>
        ))
      }
      </Routes>
      </BrowserRouter>
    </div>
    </Neo4jProvider>
    </BreakPoints.Provider>
  );
}

export default App;
