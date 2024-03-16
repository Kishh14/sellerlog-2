import { useEffect, useState } from 'react';
import { account, databases } from '../appwrite/appwrite-config';
import '../index.css'
// Icons
import { IoSearchOutline } from 'react-icons/io5';
import { HiOutlineDownload } from 'react-icons/hi';
import { IoMdClose } from 'react-icons/io';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { LuLogOut } from 'react-icons/lu';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Header = ({
  setShowFormModal,
  resetForm,
  handleUpdationModalShow,
  getData,
  filteredSellerData,
  setFilteredSellerData,
  isSearchDataFound,
  setIsSearchDataFound,
  searchCataloguer,
  setSearchCataloguer,
  searchPublish,
  setSearchPublish,
  handleSignupModalShow,
}) => {
  const [exportSellerData, setExportSellerData] = useState([]);
  const [userDetails, setUserDetails] = useState();
  const currentDate = new Date().toLocaleDateString('en-GB');
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const firstName = userDetails?.name?.split(' ')[0];

  // Get the account details if logged in
  useEffect(() => {
    const getData = account.get();
    getData.then(
      function (response) {
        setUserDetails(response);
      },
      function (error) {
        console.error(error);
      }
    );
  }, []);

  // Fetching Data
  useEffect(() => {
    const promise = databases.listDocuments(
      '65f058795179029c97a7',
      '65f058bdc26797558fcf'
    );

    promise.then(
      function (response) {
        setExportSellerData(response.documents);
      },
      function (error) {
        console.error(error);
      }
    );
  }, [getData]);

  const logoutUser = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await account.deleteSession('current');
        const successNotify = () => toast.success(`Logged Out Successfully!`);
        successNotify();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error(error);
        const errorNotify = () => toast.error(`${error}`);
        errorNotify();
      }
    } else {
      const errorNotify = () => toast.error(`Logout cancelled`);
      errorNotify();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCataloguer) {
      const filteredData = exportSellerData.filter((item) =>
        item.cataloguer.toLowerCase().includes(searchCataloguer.toLowerCase())
      );
      if (filteredData.length === 0) {
        setIsSearchDataFound(true);
        setFilteredSellerData([]);
      } else {
        setIsSearchDataFound(false);
        setFilteredSellerData(filteredData);
        console.log(filteredData);
      }
    } else {
      setFilteredSellerData(exportSellerData);
    }
  };

  const resetSearch = () => {
    setSearchCataloguer('');
    setFilteredSellerData(exportSellerData);
    setIsSearchDataFound(false);
  };

  const handlePublishSearch = (e) => {
    e.preventDefault();
    if (searchPublish) {
      const filteredData = filteredSellerData.filter(
        (item) =>
          String(item.publish).toLowerCase() ===
          String(searchPublish).toLowerCase()
      );
      if (filteredData.length === 0) {
        setIsSearchDataFound(true);
        setFilteredSellerData([]);
      } else {
        setIsSearchDataFound(false);
        setFilteredSellerData(filteredData);
        console.log(filteredData);
      }
    } else {
      setFilteredSellerData(sellerData);
    }
  };

  const resetPublishSearch = () => {
    setSearchPublish('');
    if (isSearchDataFound) {
      setFilteredSellerData(exportSellerData);
    } else {
      setFilteredSellerData(filteredSellerData);
    }
    setIsSearchDataFound(false);
  };

  return (
    <header>
      <nav className="px-2 d-flex align-items-center justify-content-between py-2 bg-dark text-white">
        <div className="ps-3 d-flex align-items-center gap-4">
          <button
            className="rounded-2 bg-primary border-0 text-white py-1 px-2"
            onClick={() => {
              resetForm();
              setShowFormModal(true);
            }}
          >
            Add Seller
          </button>
          <button
            className="rounded-2 bg-primary border-0 text-white py-1 px-2"
            onClick={() => {
              resetForm();
              handleUpdationModalShow();
            }}
          >
            Update Data
          </button>
        </div>

        <h1 className="text-opacity-75 logo d-flex align-items-center" style={{ marginLeft: '220px' }}>
          <span className="text-warning shadow">Seller</span>
          Log
        </h1>

        <div className="d-flex align-items-center justify-content-between gap-3">
          {/* Filters */}
          <form
            onSubmit={handleSearch}
            className="bg-white d-flex rounded-2"
            style={{ width: '170px', padding: '1px' }}
          >
            <input
              className="border-0 py-1 px-2 rounded-2 search-input"
              style={{ width: '100%', fontSize: '14px' }}
              value={searchCataloguer}
              placeholder="Search Cataloguer"
              onChange={(e) => {
                setSearchCataloguer(e.target.value);
              }}
            />
            <button
              onClick={resetSearch}
              className={`border-0 bg-transparent p-0 m-0 mb-1 me-1 ${
                searchCataloguer ? 'd-inline-block' : 'd-none'
              }`}
            >
              <IoMdClose style={{ fontSize: '18px' }} />
            </button>
            <button
              type="submit"
              className="border-0 bg-transparent p-0 m-0 mb-1 pe-2"
            >
              <IoSearchOutline style={{ fontSize: '18px' }} />
            </button>
          </form>
          <form
            onSubmit={handlePublishSearch}
            className="bg-white d-flex rounded-2"
            style={{ width: '140px', padding: '1px' }}
          >
            <input
              className="border-0 py-1 px-2 rounded-2 search-input"
              style={{ width: '100%', fontSize: '14px' }}
              value={searchPublish}
              placeholder="Search Publish"
              onChange={(e) => {
                setSearchPublish(e.target.value);
              }}
            />
            <button
              onClick={resetPublishSearch}
              className={`border-0 bg-transparent p-0 m-0 mb-1 me-1 ${
                searchPublish ? 'd-inline-block' : 'd-none'
              }`}
            >
              <IoMdClose style={{ fontSize: '18px' }} />
            </button>
            <button
              type="submit"
              className="border-0 bg-transparent p-0 m-0 mb-1 pe-2"
            >
              <IoSearchOutline style={{ fontSize: '18px' }} />
            </button>
          </form>

          {/* Export */}
          <div className="csv-button rounded-1">
            <CSVLink
              data={exportSellerData}
              filename={`SellerLog ${currentDate},${currentTime}.csv`}
              headers={[
                { label: 'Entity Name', key: 'entityName' },
                { label: 'Entity ID', key: 'entityID' },
                { label: 'Onboarding', key: 'onboarding' },
                { label: 'Allocation', key: 'allocation' },
                { label: 'Publish', key: 'publish' },
                { label: 'FAP', key: 'fap' },
                { label: 'Live', key: 'live' },
                { label: 'DI', key: 'di' },
                { label: 'Comments', key: 'comments' },
                { label: 'Status', key: 'status' },
                { label: 'Cataloguer', key: 'cataloguer' },
                { label: 'Category', key: 'category' },
              ]}
            >
              <HiOutlineDownload style={{ fontSize: '25px' }} />
            </CSVLink>
          </div>

          {/* Account */}
          {userDetails ? (
            <>
              <p className="m-0 p-0">Hello, {firstName}</p>
              <button className="btn p-0 text-danger" onClick={logoutUser}>
                <LuLogOut style={{ fontSize: '17px' }} />
              </button>
            </>
          ) : (
            <button
              className="btn text-primary mb-1 m-0 p-0 pe-3"
              style={{ fontSize: '25px' }}
              onClick={handleSignupModalShow}
            >
              <MdOutlineAccountCircle style={{ fontSize: '24px' }} />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
