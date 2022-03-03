import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./styles/app.sass";
import Page from "./components/Page";
import Home from "./screens/Home";
import UploadVariants from "./screens/UploadVariants";
import UploadDetails from "./screens/UploadDetails";
import UploadMultiple from "./screens/UploadMultiple";
import ConnectWallet from "./screens/ConnectWallet";
import CreateCollection from "./screens/Collections/createCollection";  
import CollectionList from "./screens/Collections/collectionList";  
import ItemsOfCollection from "./screens/Collections/ItemsOfCollection";  
import Faq from "./screens/Faq";   
import Activity from "./screens/Activity";
import Search01 from "./screens/Search01";
import Search02 from "./screens/Search02";
import Profile from "./screens/Profile";
import ProfileEdit from "./screens/ProfileEdit";
import Item from "./screens/Item";
import PageList from "./screens/PageList";
import Admin from "./screens/Admin";

function App() {
  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/"
          render={() => (
            <Page>
              <Home />
            </Page>
          )}
        />
        <Route
          exact
          path="/createCollection"
          render={() => (
            <Page>
              <CreateCollection />
            </Page>
          )}
        />
        <Route
          exact
          path="/collectionList"
          render={() => (
            <Page>
              <CollectionList />
            </Page>
          )}
        /> 
        <Route
          exact
          path="/collectionItems/:collectionId"
          render={() => (
            <Page>
              <ItemsOfCollection />
            </Page>
          )}
        />
        <Route
          exact
          path="/upload-variants"
          render={() => (
            <Page>
              <UploadVariants />
            </Page>
          )}
        />
        <Route
          exact
          path="/upload-multiple/:asset_id"
          render={() => (
            <Page>
              <UploadMultiple />
            </Page>
          )}
        />
        <Route
          exact
          path="/upload-details/:asset_id"
          render={() => (
            <Page>
              <UploadDetails />
            </Page>
          )}
        />
        <Route
          exact
          path="/connect-wallet"
          render={() => (
            <Page>
              <ConnectWallet />
            </Page>
          )}
        />
        <Route
          exact
          path="/faq"
          render={() => (
            <Page>
              <Faq />
            </Page>
          )}
        />
        <Route
          exact
          path="/activity"
          render={() => (
            <Page>
              <Activity />
            </Page>
          )}
        />
        <Route
          exact
          path="/search01"
          render={() => (
            <Page>
              <Search01 />
            </Page>
          )}
        />
        <Route
          exact
          path="/search02"
          render={() => (
            <Page>
              <Search02 />
            </Page>
          )}
        />
        <Route
          exact
          path="/profile/:userId"
          render={() => (
            <Page>
              <Profile />
            </Page>
          )}
        />
        <Route
          exact
          path="/profile-edit"
          render={() => (
            <Page>
              <ProfileEdit />
            </Page>
          )}
        />
        <Route
          exact
          path="/item/:id"
          render={() => (
            <Page>
              <Item />
            </Page>
          )}
        />
        <Route
          exact
          path="/pagelist"
          render={() => (
            <Page>
              <PageList />
            </Page>
          )}
        />
        <Route
          exact
          path="/admin"
          render={() => (
            // <Page>
              <Admin />
            // </Page>
          )}
        />
      </Switch>
    </Router>
  );
}

export default App;
