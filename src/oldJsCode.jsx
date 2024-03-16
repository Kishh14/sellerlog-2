import { useEffect, useState } from 'react';
import SellerDataService from './services/sellerData.service';
import { serverTimestamp } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Offcanvas from 'react-bootstrap/Offcanvas';
import SuccessAlert from './components/SuccessAlert';
import ErrorAlert from './components/ErrorAlert';
import Dropdown from 'react-bootstrap/Dropdown';

// Icons
import { TfiCommentAlt } from 'react-icons/tfi';
import { HiOutlineDownload } from 'react-icons/hi';
import { IoSearchOutline } from 'react-icons/io5';
import { IoMdClose } from 'react-icons/io';
import { IoSettingsSharp } from 'react-icons/io5';
import { BsChevronDoubleDown } from 'react-icons/bs';

function App() {
  const [entityName, setEntityName] = useState('');
  const [entityID, setEntityID] = useState();
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState('');
  const [cataloguer, setCataloguer] = useState('Select Cataloguer');
  const [onboarding, setOnboarding] = useState('');
  const [allocation, setAllocation] = useState('');
  const [publish, setPublish] = useState('');
  const [fap, setFap] = useState('');
  const [live, setLive] = useState('');
  const [di, setDi] = useState('');
  const [searchCataloguer, setSearchCataloguer] = useState('');
  const [searchPublish, setSearchPublish] = useState('');

  const [sellerData, setSellerData] = useState([]);
  const [filteredSellerData, setFilteredSellerData] = useState([]);
  const [category, setCategory] = useState('');
  const [sellerComments, setSellerComments] = useState({});
  const [dataToExport, setdataToExport] = useState([]);
  const [headersForCSVData, setheadersForCSVData] = useState([]);
  const [sellerDataId, setSellerDataId] = useState();
  const [multipleDeleteSellerDataId, setMultipleDeleteSellerDataId] = useState(
    []
  );
  const [editMode, setEditMode] = useState(false);
  const [sellerDataIndex, setSellerDataIndex] = useState();
  const [isSearchDataFound, setIsSearchDataFound] = useState(false);
  const [isImportingFile, setIsImportingFile] = useState();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showDeleteChecks, setShowDeleteChecks] = useState(false);
  const [statusError, setStatusError] = useState(false);
  const [commentsRequired, setCommentsRequired] = useState(false);
  const [fileForUpdatingData, setFileForUpdatingData] = useState(null);

  // Comment Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Form Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const handleFormModalClose = () => setShowFormModal(false);
  const handleFormModalShow = () => setShowFormModal(true);

  // Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleDeleteModalClose = () => setShowDeleteModal(false);
  const handleDeleteModalShow = () => setShowDeleteModal(true);

  // Updation Modal
  const [showUpdationModal, setShowUpdationModal] = useState(false);
  const handleUpdationModalClose = () => setShowUpdationModal(false);
  const handleUpdationModalShow = () => setShowUpdationModal(true);

  // Alert
  const [showAddedAlert, setshowAddedAlert] = useState(false);
  const [showErrAlert, setshowErrAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetching the data and populating UI
  useEffect(() => {
    if (!sellerData || sellerData.length === 0) {
      getSellerData();
    }
  }, []);

  useEffect(() => {
    setFilteredSellerData(sellerData);
  }, [sellerData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const calculateCategory = () => {
      if (Number(live) <= Number(3) && Number(live) > Number(0)) {
        return 'Low SKUs';
      } else if (Number(live) === Number(0)) {
        return 'Non-Live';
      } else if (Number(di) === Number(1)) {
        return "Low DI's";
      } else {
        return 'Uncategorised';
      }
    };
    const categoryFnc = calculateCategory();

    const existingEntityID = sellerData.find(
      (seller) => seller.entityID === entityID
    );

    const newSellerData = {
      entityName,
      entityID,
      onboarding,
      allocation,
      publish,
      fap,
      live,
      di,
      status,
      cataloguer,
      category: categoryFnc,
      timestampField: serverTimestamp(),
    };
    const updateSellerData = {
      entityName,
      entityID,
      onboarding,
      allocation,
      publish,
      fap,
      live,
      di,
      status,
      cataloguer,
      category: category === 'Paid Seller' ? category : categoryFnc,
    };

    try {
      if (editMode) {
        if (!status) {
          setStatusError(true);
          return;
        } else if (status) {
          setStatusError(false);

          // Update existing data if in edit mode
          await SellerDataService.updateSellerData(
            sellerDataId,
            updateSellerData
          );
          const updatedData = [...sellerData];
          updatedData[sellerDataIndex] = updateSellerData;
          setSellerData(updatedData);

          setEditMode(false);
          resetForm();
          setshowAddedAlert(true);
          handleFormModalClose();
          getSellerData();
        }
      } else {
        // Add new data if not in edit mode
        if (existingEntityID) {
          setErrorMessage(
            'Seller With Same Entity ID Already Exists! ' +
              existingEntityID.entityName +
              ' - ' +
              existingEntityID.entityID
          );
          setshowErrAlert(true);
          handleFormModalClose();
          resetForm();
        } else {
          const addedSeller = await SellerDataService.addSellerData(
            newSellerData
          );

          // Initialize an empty comments array for the new seller
          setSellerComments((prevComments) => ({
            ...prevComments,
            [addedSeller.id]: [],
          }));

          resetForm();
          setshowAddedAlert(true);
          handleFormModalClose();
          getSellerData();
        }
      }
    } catch (err) {
      console.error(err);
      alert(
        'Error occurred while adding the data in database, see console for more info!'
      );
    }
  };

  const resetForm = () => {
    setEntityName('');
    setEntityID('');
    setOnboarding('');
    setAllocation('');
    setPublish('');
    setFap('');
    setLive('');
    setDi('');
    setComments('');
    setStatus('');
    setCataloguer('');
    setMultipleDeleteSellerDataId([]);
    setFileForUpdatingData(null);
  };

  const getSellerData = async () => {
    try {
      const sellerData = await SellerDataService.getAllSellerData();
      const data = sellerData.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      data.sort((a, b) => {
        if (a.timestampField < b.timestampField) {
          return -1;
        }
        if (a.timestampField > b.timestampField) {
          return 1;
        }
        return 0;
      });

      if (searchCataloguer) {
        setFilteredSellerData(
          data.filter((item) =>
            item.cataloguer
              .toLowerCase()
              .includes(searchCataloguer.toLowerCase())
          )
        );
      } else {
        setSellerData(data);
      }

      resetForm();
    } catch (err) {
      if (err.code === 'resource-exhausted') {
        alert('Database Quota Exeeded, Please Try Again Later!');
        console.error(err);
      } else {
        alert('Error occurred while fetching the data from database, ' + err);
        console.error(err);
      }
    }
  };

  const loadComments = async (sellerId) => {
    try {
      const commentsSnap = await SellerDataService.getSellerComments(sellerId);
      const comments = commentsSnap.docs.map((commentDoc) => commentDoc.data());
      setSellerComments((prevComments) => ({
        ...prevComments,
        [sellerId]: comments,
      }));
    } catch (err) {
      console.error(err);
      alert(
        'Error occurred while fetching comments, see console for more info!'
      );
    }
  };

  const findIndex = (data, id) => {
    return data.findIndex((item) => item.id === id);
  };

  const handleSelectionClick = (e, id) => {
    setMultipleDeleteSellerDataId((prevState) => {
      const arr = [...prevState];
      if (e.target.checked) {
        arr.push(id);
      } else {
        const index = arr.indexOf(id);
        if (index !== -1) {
          arr.splice(index, 1);
        }
      }
      return arr;
    });
  };

  const deleteHandler = async () => {
    try {
      const deletePromises = multipleDeleteSellerDataId.map(
        async (sellerID) => {
          // Get comments associated with the seller
          const commentsSnap = await SellerDataService.getSellerComments(
            sellerID
          );

          // Delete each comment
          commentsSnap.forEach(async (commentDoc) => {
            await SellerDataService.deleteComment(sellerID, commentDoc.id);
          });

          // Delete the seller data
          await SellerDataService.deleteSellerData(sellerID);
        }
      );
      await Promise.all(deletePromises);

      getSellerData();
      setshowAddedAlert(true);
    } catch (err) {
      console.error(err);
      alert(
        'Error occurred while deleting the data from database, see console for more info!'
      );
    }
  };

  useEffect(() => {
    console.log('Selection is going on...');
  }, [multipleDeleteSellerDataId]);

  const getSellerDataHandler = (id) => {
    const index = findIndex(sellerData, id);
    setSellerDataId(id);
    setSellerDataIndex(index); // Maintain the index of the edited record
  };

  const editHandler = async () => {
    try {
      const docSnap = await SellerDataService.getSellerData(sellerDataId);
      const data = docSnap.data();

      // Populate the form fields with the existing data for editing
      setEntityName(data.entityName || '');
      setEntityID(data.entityID || '');
      setOnboarding(data.onboarding || '');
      setAllocation(data.allocation || '');
      setPublish(data.publish || '');
      setFap(data.fap || '');
      setLive(data.live || '');
      setDi(data.di || '');
      setStatus(data.status);
      setCategory(data.category || 'Uncategorised');
      setCataloguer(data.cataloguer || 'Select Cataloguer');

      // Set comments for the current seller
      setComments(sellerComments[sellerDataId] || '');
    } catch (err) {
      console.error(err);
      alert(
        'Error occurred while editing the data, see console for more info!'
      );
    }
  };

  const handleCommentUpdate = async () => {
    if (!comments) {
      alert('Please enter a comment.');
      return;
    }

    if (!sellerDataId) {
      console.error('Invalid sellerDataId');
      alert('Seller data ID not found, see console for more info!');
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-GB');
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const fullDateTime = `${currentDate}, ${currentTime}`;
    const commentWithDate = `${fullDateTime} - ${comments}`;

    try {
      await SellerDataService.addComment(sellerDataId, commentWithDate);
      const commentsSnap = await SellerDataService.getComments(sellerDataId);
      const updatedCommentsArr = commentsSnap.docs.map(
        (commentDoc) => commentDoc.data().text
      );

      setSellerComments((prevComments) => ({
        ...prevComments,
        [sellerDataId]: updatedCommentsArr,
      }));

      setComments('');
      loadComments(sellerDataId);
    } catch (err) {
      console.error(err);
      alert(
        'Error occurred while adding the comment in database, see console for more info!'
      );
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCataloguer) {
      const filteredData = sellerData.filter((item) =>
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
      setFilteredSellerData(sellerData);
    }
  };

  const resetSearch = () => {
    setSearchCataloguer('');
    setFilteredSellerData(sellerData);
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
    setFilteredSellerData(filteredSellerData);
    setIsSearchDataFound(false);
  };

  const handleExport = async () => {
    try {
      const dataObj = [];
      let commentsDataToExport = {};
      const headersForCSVData = [
        { label: 'S.No', key: 'SNo' },
        { label: 'Entity Name', key: 'EntityName' },
        { label: 'Entity ID', key: 'EntityID' },
        { label: 'Onboarding', key: 'Onboarding' },
        { label: 'Allocation', key: 'Allocation' },
        { label: 'Publish', key: 'Publish' },
        { label: 'FAP', key: 'Fap' },
        { label: 'Live', key: 'Live' },
        { label: 'DI', key: 'Di' },
        { label: 'Comments', key: 'Comments' },
        { label: 'Status', key: 'Status' },
        { label: 'Cataloguer', key: 'Cataloguer' },
        { label: 'Category', key: 'Category' },
      ];

      const allComments = await Promise.all(
        sellerData.map(async (seller) => {
          const commentsSnap = await SellerDataService.getSellerComments(
            seller.id
          );
          const comments = commentsSnap.docs.map((commentDoc) =>
            commentDoc.data()
          );
          return { [seller.id]: comments };
        })
      );

      commentsDataToExport = allComments.reduce(
        (acc, comments) => ({ ...acc, ...comments }),
        {}
      );

      sellerData.map((seller, index) => {
        const obj = {
          SNo: index + 1,
          EntityName: seller.entityName,
          EntityID: seller.entityID,
          Onboarding: seller.onboarding,
          Allocation: seller.allocation,
          Publish: seller.publish,
          Fap: seller.fap,
          Live: seller.live,
          Di: seller.di,
          Comments: commentsDataToExport[seller.id.toString()]
            ? commentsDataToExport[seller.id.toString()]
                .map((comment) => comment.text)
                .join(' || ')
            : '',
          Status: seller.status,
          Cataloguer: seller.cataloguer,
          Category: seller.category,
        };

        dataObj.push(obj);
      });
      setdataToExport(dataObj);
      setheadersForCSVData(headersForCSVData);
    } catch (e) {
      console.error(`Error exporting CSV file: ${e}`);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadedFile(file);
  };

  function ExcelDateToJSDate(data) {
    // Check if data is a valid number (potentially representing a serial number)
    if (typeof data === 'number' && !isNaN(data)) {
      var utc_days = Math.floor(data - 25569);
      var utc_value = utc_days * 86400;
      var date_info = new Date(utc_value * 1000);

      var fractional_day = data - Math.floor(data) + 0.0000001;

      var total_seconds = Math.floor(86400 * fractional_day);

      var seconds = total_seconds % 60;

      total_seconds -= seconds;

      var hours = Math.floor(total_seconds / (60 * 60));
      var minutes = Math.floor(total_seconds / 60) % 60;

      // Formatting the date with leading zero padding
      var day = date_info.getDate().toString().padStart(2, '0');
      var month = (date_info.getMonth() + 1).toString().padStart(2, '0');
      var year = date_info.getFullYear();

      // Returning the formatted date string
      return day + '/' + month + '/' + year;
    } else {
      // Return the original data if not a valid number
      return data;
    }
  }

  const handleImportData = (e) => {
    e.preventDefault();
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        const arr = [];

        parsedData.map((item) => {
          const obj = {
            entityName: item['Entity Name'] || 'N/A',
            entityID: item['Entity ID'] || 'N/A',
            cataloguer: item.Cataloguer || 'N/A',
            onboarding: ExcelDateToJSDate(item.Onboarding) || 'N/A',
            allocation: ExcelDateToJSDate(item.Allocation) || 'N/A',
            publish: ExcelDateToJSDate(item.Publish) || 'N/A',
            fap: item.FAP || 'N/A',
            live: item.Live || 'N/A',
            di: item.Di || 'N/A',
            status: item.Status || '',
            category:
              item.live <= 3
                ? 'Low SKUs'
                : item.live === 0
                ? 'Non-Live'
                : item.di === 1
                ? "Low DI's"
                : 'Uncategorised',
            timestampField: serverTimestamp(),
          };
          arr.push(obj);
        });

        arr.map(async (newSellerObj) => {
          const existingEntityID = sellerData.find(
            (seller) => seller.entityID === newSellerObj.entityID
          );

          try {
            if (existingEntityID) {
              handleFormModalClose();
              setshowErrAlert(true);
              setErrorMessage(
                'Seller With Same Entity ID Already Exists! ' +
                  existingEntityID.entityName +
                  ' - ' +
                  existingEntityID.entityID
              );
            } else {
              const addedSeller = await SellerDataService.addSellerData(
                newSellerObj
              );
              // Add comments initialization logic
              if (addedSeller) {
                setSellerComments((prevComments) => ({
                  ...prevComments,
                  [addedSeller.id]: [], // Initialize empty comments array
                }));
              } else {
                console.error(
                  'Error adding seller, unable to initialize comments.'
                );
              }
              getSellerData();
              handleFormModalClose();
              setshowAddedAlert(true);
              resetForm();
            }
          } catch (err) {
            console.error('Error Adding New Sellers' + err);
            alert('Error adding data, wait and try, or see console!');
          }
        });
      };
      reader.readAsBinaryString(uploadedFile);
    }
  };

  const handleCategoryChange = async (id, newCategory) => {
    try {
      // Update the seller data with the new category
      const updatedSellerData = {
        ...sellerData.find((seller) => seller.id === id),
        category: newCategory,
      };

      await SellerDataService.updateSellerData(id, updatedSellerData);

      // Update the state with the new category
      const sellerDataIndex = sellerData.findIndex(
        (seller) => seller.id === id
      );
      sellerData[sellerDataIndex].category = newCategory;
      setSellerData([...sellerData]);

      console.log('Seller category updated successfully!');
    } catch (err) {
      console.error('Error updating seller category:', err);
      alert(
        'Error occurred while updating seller category, see console for more info!'
      );
    }
  };

  const handleFileForUpdatingData = (e) => {
    const newFile = e.target.files[0];
    setFileForUpdatingData(newFile);
  };

  const handleUpdatingData = (e) => {
    e.preventDefault();
    if (fileForUpdatingData) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);

        parsedData.map((parsedSeller) => {
          sellerData.filter(async (seller) => {
            console.log(seller.entityID, typeof seller.entityID);
            try {
              if (
                String(seller.entityID) === String(parsedSeller['Entity ID'])
              ) {
                const calculateCategory = () => {
                  if (
                    Number(parsedSeller.Live) <= Number(3) &&
                    Number(parsedSeller.Live) > Number(0)
                  ) {
                    return 'Low SKUs';
                  } else if (Number(parsedSeller.Live) === Number(0)) {
                    return 'Non-Live';
                  } else if (Number(parsedSeller.DI) === Number(1)) {
                    return "Low DI's";
                  } else {
                    return 'Uncategorised';
                  }
                };
                const categoryFnc = calculateCategory();
                const newSellerDataIndex = findIndex(sellerData, seller.id);

                const newData = {
                  entityName: seller.entityName,
                  entityID: seller.entityID,
                  onboarding: seller.onboarding,
                  allocation: seller.allocation,
                  publish: seller.publish,
                  fap: parsedSeller.FAP,
                  live: parsedSeller.Live,
                  di: parsedSeller.DI,
                  status: seller.status,
                  cataloguer: seller.cataloguer,
                  category:
                    seller.category === 'Paid Seller'
                      ? seller.category
                      : categoryFnc,
                };
                await SellerDataService.updateSellerData(seller.id, newData);
                const updatedData = [...sellerData];
                updatedData[newSellerDataIndex] = newData;

                setSellerData(updatedData);
                getSellerData();
                resetForm();
                setshowAddedAlert(true);
                handleFormModalClose();
              }
            } catch (err) {
              console.error('Error while updating the FAP/Live/DI', err);
              alert(
                'An error occurred while updating the data.\nPlease try again or contact the developer.'
              );
            }
          });
        });
      };
      reader.readAsBinaryString(fileForUpdatingData);
      handleUpdationModalClose();
    } else {
      alert('Please upload file in Excel format, or try again later!');
    }
  };

  // This will call the edit handler
  useEffect(() => {
    if (sellerDataId !== undefined && sellerDataId !== '') {
      editHandler();
    }
  }, [editMode, sellerDataId]);

  useEffect(() => {
    handleExport();
  }, [sellerData, sellerComments]);

  const currentDate = new Date().toLocaleDateString('en-GB');
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      {/* Navbar */}
      <div className="px-2 d-flex align-items-center justify-content-between py-2 bg-dark text-white">
        <div className="ps-3 d-flex align-items-center gap-4">
          {/* Add Seller */}
          <button
            className="rounded-2 bg-primary border-0 text-white py-1 px-2"
            onClick={() => {
              resetForm();
              handleFormModalShow();
            }}
          >
            Add Seller
          </button>
          <Offcanvas show={showFormModal} onHide={handleFormModalClose}>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Add New Seller</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <div className="d-flex gap-3 justify-content-center mb-2 border-bottom w-100 pb-2">
                <button
                  onClick={() => {
                    setIsImportingFile(true);
                  }}
                  className="rounded-2 bg-primary border-0 text-white btn"
                  style={{ fontSize: '14px' }}
                >
                  Upload File
                </button>
                <button
                  onClick={() => {
                    setIsImportingFile(false);
                  }}
                  className="rounded-2 bg-primary border-0 text-white"
                  style={{ fontSize: '14px' }}
                >
                  Add Manually
                </button>
              </div>

              {isImportingFile ? (
                <form onSubmit={handleImportData} className="my-4">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="form-control w-75"
                    placeholder="Upload file..."
                  />
                  <button className="add-button rounded-3 mt-3" type="submit">
                    <span className="button__text ps-1">Submit</span>
                    <span className="button__icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        stroke="currentColor"
                        height="24"
                        fill="none"
                        className="svg"
                      >
                        <line y2="19" y1="5" x2="12" x1="12"></line>
                        <line y2="12" y1="12" x2="19" x1="5"></line>
                      </svg>
                    </span>
                  </button>
                </form>
              ) : isImportingFile === false ? (
                <form onSubmit={handleSubmit} className="mb-3">
                  <div className="form-control">
                    <input
                      type="text"
                      id="entityName"
                      name="entityName"
                      required=""
                      className="input input-alt"
                      placeholder="Entity Name"
                      value={entityName}
                      onChange={(e) => {
                        setEntityName(e.target.value);
                      }}
                    />
                    <span className="input-border input-border-alt"></span>
                  </div>

                  <div className="form-control">
                    <input
                      type="text"
                      id="id"
                      name="id"
                      className="input input-alt"
                      placeholder="Entity ID"
                      required
                      value={entityID}
                      onChange={(e) => {
                        setEntityID(e.target.value);
                      }}
                    />
                    <span className="input-border input-border-alt"></span>
                  </div>

                  <div className="form-control">
                    <input
                      type="text"
                      id="onboarding"
                      name="onboarding"
                      className="input input-alt"
                      placeholder="Onboarding"
                      value={onboarding}
                      onChange={(e) => {
                        setOnboarding(e.target.value);
                      }}
                    />
                    <span className="input-border input-border-alt"></span>
                  </div>

                  <div className="form-control">
                    <input
                      type="text"
                      id="allocation"
                      name="allocation"
                      className="input input-alt"
                      placeholder="Allocation"
                      value={allocation}
                      onChange={(e) => {
                        setAllocation(e.target.value);
                      }}
                    />
                    <span className="input-border input-border-alt"></span>
                  </div>

                  <div className="form-control">
                    <input
                      type="text"
                      id="publish"
                      name="publish"
                      className="input input-alt"
                      placeholder="Publish"
                      value={publish}
                      onChange={(e) => {
                        setPublish(e.target.value);
                      }}
                    />
                    <span className="input-border input-border-alt"></span>
                  </div>

                  <div className="form-control">
                    <input
                      type="text"
                      id="fap"
                      name="fap"
                      className="input input-alt"
                      placeholder="FAP"
                      value={fap}
                      onChange={(e) => {
                        setFap(e.target.value);
                      }}
                    />
                    <span className="input-border input-border-alt"></span>
                  </div>

                  <div className="form-control">
                    <input
                      type="text"
                      id="live"
                      name="live"
                      className="input input-alt"
                      placeholder="Live"
                      value={live}
                      onChange={(e) => {
                        setLive(e.target.value);
                      }}
                    />
                    <span className="input-border input-border-alt"></span>
                  </div>

                  <div className="form-control">
                    <input
                      type="text"
                      id="di"
                      name="di"
                      className="input input-alt"
                      placeholder="DI"
                      value={di}
                      onChange={(e) => {
                        setDi(e.target.value);
                      }}
                    />
                    <span className="input-border input-border-alt"></span>
                  </div>

                  <div className="form-control">
                    <select
                      id="cataloguer"
                      className="input input-alt"
                      value={cataloguer}
                      onChange={(e) => {
                        setCataloguer(e.target.value);
                      }}
                    >
                      <option value={'N/A'} className="text-secondary">
                        Select Cataloguer
                      </option>
                      <option value="Akash Sharma">Akash Sharma</option>
                      <option value="Arjun Kurrey">Arjun Kurrey</option>
                      <option value="Anju Barange">Anju Barange</option>
                      <option value="Deependra Ghamal">Deependra Ghamal</option>
                      <option value="Fardeen Khan">Fardeen Khan</option>
                      <option value="Krithika">Krithika</option>
                      <option value="Priya Kanariya">Priya Kanariya</option>
                      <option value="Renuka Tangraj">Renuka Tangraj</option>
                      <option value="Sagar Pal">Sagar Pal</option>
                      <option value="Simran Verma">Simran Verma</option>
                      <option value="Vimal Sharma">Vimal Sharma</option>
                    </select>
                    <span className="input-border input-border-alt"></span>
                  </div>

                  <button
                    className="add-button rounded-3 ms-1 mt-2"
                    type="submit"
                  >
                    <span className="button__text">Add Seller</span>
                    <span className="button__icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        stroke="currentColor"
                        height="24"
                        fill="none"
                        className="svg"
                      >
                        <line y2="19" y1="5" x2="12" x1="12"></line>
                        <line y2="12" y1="12" x2="19" x1="5"></line>
                      </svg>
                    </span>
                  </button>
                </form>
              ) : null}

              <div
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  width: '90%',
                  textAlign: 'center',
                }}
              >
                <p>
                  Made with 💙 by
                  <a
                    className="ms-1 text-white"
                    href="https://kishan-salvi.netlify.app"
                    target="_blank"
                  >
                    Kishan
                  </a>
                </p>
              </div>
            </Offcanvas.Body>
          </Offcanvas>

          {/* Update FAP/Live/DI */}
          <button
            className="rounded-2 bg-primary border-0 text-white py-1 px-2"
            onClick={() => {
              resetForm();
              handleUpdationModalShow();
            }}
          >
            Update FAP/Live/DI
          </button>

          <h1 className="fs-3 text-opacity-75" style={{ marginLeft: '360px' }}>
            <span className="text-warning shadow">Seller</span>
            Log
          </h1>
        </div>

        <SuccessAlert
          showAddedAlert={showAddedAlert}
          setshowAddedAlert={setshowAddedAlert}
        />

        <ErrorAlert
          showErrAlert={showErrAlert}
          setshowErrAlert={setshowErrAlert}
          message={errorMessage}
        />

        <div className="d-flex align-items-center justify-content-between gap-4">
          {/* Searchbars */}
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

          <div className="csv-button pe-3">
            <CSVLink
              data={dataToExport}
              filename={`SellerLog ${currentDate},${currentTime}.csv`}
              headers={headersForCSVData}
            >
              <HiOutlineDownload style={{ fontSize: '25px' }} />
            </CSVLink>
          </div>
        </div>
      </div>

      {!isSearchDataFound ? null : (
        <img
          src="https://www.archanaprojects.com/Frontend/images/not-found.png"
          alt="No Data Found"
          className="w-25 m-auto d-block my-5"
        />
      )}

      <div>
        {/* Table */}
        <section
          style={{
            height: '92vh',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              overflowX: 'hidden',
              borderTop: 'none',
              marginBottom: '13px',
            }}
          >
            <thead
              style={{
                position: 'sticky',
                top: '0',
                background: '#f5f5f5',
                border: '1px solid lightgray',
                zIndex: '9',
              }}
              className={`${!isSearchDataFound ? '' : 'd-none'}`}
            >
              <tr
                style={{
                  background: '#f5f5f5',
                  borderBottom: '1px solid lightgray',
                }}
                key={'HeaderRow ' + Math.floor(Math.random() * 100000)}
              >
                {showDeleteChecks ? (
                  <th
                    style={{ padding: '15px 25px', textAlign: 'left' }}
                    key={'selectSeller' + Math.floor(Math.random() * 1000000)}
                  >
                    Select
                  </th>
                ) : null}
                <th
                  style={{ padding: '15px 25px', textAlign: 'left' }}
                  key={'#' + Math.floor(Math.random() * 1000000)}
                >
                  #
                </th>
                <th
                  style={{ padding: '10px', textAlign: 'left' }}
                  key={'Entity Name' + Math.floor(Math.random() * 1000000)}
                >
                  <Dropdown className="bg-transparent category-dropdown">
                    <Dropdown.Toggle>Entity Name</Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => {
                          setFilteredSellerData(sellerData);
                        }}
                      >
                        Show All
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          const newData =
                            searchCataloguer || searchPublish
                              ? filteredSellerData.filter(
                                  (item) => item.category === 'Low SKUs'
                                )
                              : sellerData.filter(
                                  (item) => item.category === 'Low SKUs'
                                );
                          setFilteredSellerData(newData);
                        }}
                      >
                        Low SKUs
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          const nonLiveData =
                            searchCataloguer || searchPublish
                              ? filteredSellerData.filter(
                                  (item) => item.category === 'Non-Live'
                                )
                              : sellerData.filter(
                                  (item) => item.category === 'Non-Live'
                                );
                          setFilteredSellerData(nonLiveData);
                        }}
                      >
                        Non-Live
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          const lowDIsData =
                            searchCataloguer || searchPublish
                              ? filteredSellerData.filter(
                                  (item) => item.category === "Low DI's"
                                )
                              : sellerData.filter(
                                  (item) => item.category === "Low DI's"
                                );
                          setFilteredSellerData(lowDIsData);
                        }}
                      >
                        Low DI's
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          const paidData =
                            searchCataloguer || searchPublish
                              ? filteredSellerData.filter(
                                  (item) => item.category === 'Paid Seller'
                                )
                              : sellerData.filter(
                                  (item) => item.category === 'Paid Seller'
                                );
                          setFilteredSellerData(paidData);
                        }}
                      >
                        Paid Sellers
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          const uncategorisedData =
                            searchCataloguer || searchPublish
                              ? filteredSellerData.filter(
                                  (item) => item.category === 'Uncategorised'
                                )
                              : sellerData.filter(
                                  (item) => item.category === 'Uncategorised'
                                );
                          setFilteredSellerData(uncategorisedData);
                        }}
                      >
                        Uncategorised
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </th>
                <th
                  style={{ padding: '10px', textAlign: 'left' }}
                  key={'Entity ID' + Math.floor(Math.random() * 1000000)}
                >
                  Entity ID
                </th>
                <th
                  style={{ padding: '10px', textAlign: 'left' }}
                  key={'Cataloguer' + Math.floor(Math.random() * 1000000)}
                >
                  Cataloguer
                </th>
                <th
                  style={{ padding: '10px', textAlign: 'left' }}
                  key={'Onboarding' + Math.floor(Math.random() * 1000000)}
                >
                  Onboarding
                </th>
                <th
                  style={{ padding: '10px', textAlign: 'left' }}
                  key={'Allocation' + Math.floor(Math.random() * 1000000)}
                >
                  Allocation
                </th>
                <th
                  style={{ padding: '10px', textAlign: 'left' }}
                  key={'Publish' + Math.floor(Math.random() * 1000000)}
                >
                  Publish
                </th>
                <th
                  style={{ padding: '10px', textAlign: 'left' }}
                  key={'FAP' + Math.floor(Math.random() * 1000000)}
                >
                  FAP
                </th>
                <th
                  style={{ padding: '10px', textAlign: 'left' }}
                  key={'Live' + Math.floor(Math.random() * 1000000)}
                >
                  Live
                </th>
                <th
                  style={{ padding: '10px', textAlign: 'left' }}
                  key={'DI' + Math.floor(Math.random() * 1000000)}
                >
                  DI
                </th>
                <th
                  style={{ padding: '10px', textAlign: 'center' }}
                  key={'Comments' + Math.floor(Math.random() * 1000000)}
                >
                  Comments
                </th>
                <th
                  style={{ padding: '10px', textAlign: 'left' }}
                  key={'Status' + Math.floor(Math.random() * 1000000)}
                >
                  Status
                </th>
                <th
                  style={{ padding: '15px 20px', textAlign: 'left' }}
                  key={'Action' + Math.floor(Math.random() * 1000000)}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSellerData.length != 0 ? (
                filteredSellerData.map((doc, index) => {
                  return (
                    <>
                      <tr
                        key={doc.id}
                        style={{
                          background: 'white',
                          borderBottom: '1px solid #dee2e6',
                          verticalAlign: 'top',
                        }}
                        className="mb-5"
                      >
                        {showDeleteChecks ? (
                          <td
                            style={{
                              padding: '15px 15px',
                              textAlign: 'center',
                            }}
                          >
                            <input
                              type="checkbox"
                              onClick={(e) => {
                                handleSelectionClick(e, doc.id);
                              }}
                              style={{
                                cursor: 'pointer',
                                width: '15px',
                                height: '15px',
                                margin: 'auto',
                              }}
                            />
                          </td>
                        ) : null}
                        <td style={{ padding: '15px 25px', textAlign: 'left' }}>
                          {index + 1}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'left' }}>
                          {editMode && sellerDataId === doc.id ? (
                            <input
                              type="text"
                              className="form-control border border-secondary py-1"
                              placeholder="Entity Name"
                              value={entityName}
                              onChange={(e) => setEntityName(e.target.value)}
                            />
                          ) : (
                            <>
                              <span>{doc.entityName || 'N/A'} </span>
                              <br />
                              <Dropdown>
                                <Dropdown.Toggle
                                  variant={`${
                                    doc.category == 'Uncategorised'
                                      ? 'secondary'
                                      : doc.category == 'Paid Seller'
                                      ? 'success'
                                      : 'warning'
                                  }`}
                                  id="category-dropdown"
                                  style={{
                                    fontSize: '12px',
                                    padding: '2px 3px',
                                  }}
                                >
                                  {doc.category || ''}
                                </Dropdown.Toggle>
                                {doc.category === 'Paid Seller' ? null : (
                                  <Dropdown.Menu
                                    className="border-0 shadow"
                                    style={{ width: '25px' }}
                                  >
                                    <>
                                      <Dropdown.Item className="w-50">
                                        <span
                                          className="border-0 p-0 m-0"
                                          onClick={() =>
                                            handleCategoryChange(
                                              doc.id,
                                              'Paid Seller'
                                            )
                                          }
                                        >
                                          Paid Seller
                                        </span>
                                      </Dropdown.Item>
                                    </>
                                  </Dropdown.Menu>
                                )}
                              </Dropdown>
                            </>
                          )}
                        </td>

                        <td style={{ padding: '10px', textAlign: 'left' }}>
                          {editMode && sellerDataId === doc.id ? (
                            <input
                              type="text"
                              className="form-control border border-secondary py-1"
                              placeholder="Entity ID"
                              value={entityID}
                              onChange={(e) => setEntityID(e.target.value)}
                            />
                          ) : (
                            doc.entityID || 'N/A'
                          )}
                        </td>

                        <td style={{ padding: '10px', textAlign: 'left' }}>
                          {editMode && sellerDataId === doc.id ? (
                            <select
                              className="form-control border border-secondary"
                              style={{ padding: '4px 3px' }}
                              value={cataloguer}
                              onChange={(e) => {
                                setCataloguer(e.target.value);
                              }}
                            >
                              <option value={'N/A'} className="text-secondary">
                                Select Cataloguer
                              </option>
                              <option value="Akash Sharma">Akash Sharma</option>
                              <option value="Arjun Kurrey">Arjun Kurrey</option>
                              <option value="Anju Barange">Anju Barange</option>
                              <option value="Deependra Ghamal">
                                Deependra Ghamal
                              </option>
                              <option value="Fardeen Khan">Fardeen Khan</option>
                              <option value="Krithika">Krithika</option>
                              <option value="Priya Kanariya">
                                Priya Kanariya
                              </option>
                              <option value="Renuka Tangraj">
                                Renuka Tangraj
                              </option>
                              <option value="Sagar Pal">Sagar Pal</option>
                              <option value="Simran Verma">Simran Verma</option>
                              <option value="Vimal Sharma">Vimal Sharma</option>
                            </select>
                          ) : (
                            doc.cataloguer || 'N/A'
                          )}
                        </td>

                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {editMode && sellerDataId === doc.id ? (
                            <input
                              type="text"
                              className="form-control border border-secondary py-1"
                              placeholder="Onboarding"
                              value={onboarding}
                              onChange={(e) => setOnboarding(e.target.value)}
                            />
                          ) : (
                            doc.onboarding || 'N/A'
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {editMode && sellerDataId === doc.id ? (
                            <input
                              type="text"
                              className="form-control border border-secondary py-1"
                              placeholder="Allocation"
                              value={allocation}
                              onChange={(e) => setAllocation(e.target.value)}
                            />
                          ) : (
                            doc.allocation || 'N/A'
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {editMode && sellerDataId === doc.id ? (
                            <input
                              type="text"
                              className="form-control border border-secondary py-1"
                              placeholder="Publish"
                              value={publish}
                              onChange={(e) => setPublish(e.target.value)}
                            />
                          ) : (
                            doc.publish || 'N/A'
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {editMode && sellerDataId === doc.id ? (
                            <input
                              type="text"
                              className="form-control border border-secondary py-1"
                              placeholder="FAP"
                              value={fap}
                              onChange={(e) => setFap(e.target.value)}
                            />
                          ) : (
                            doc.fap || 'N/A'
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {editMode && sellerDataId === doc.id ? (
                            <input
                              type="text"
                              className="form-control border border-secondary py-1"
                              placeholder="Live"
                              value={live}
                              onChange={(e) => setLive(e.target.value)}
                            />
                          ) : (
                            doc.live || 'N/A'
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          {editMode && sellerDataId === doc.id ? (
                            <input
                              type="text"
                              className="form-control border border-secondary py-1"
                              placeholder="DI"
                              value={di}
                              onChange={(e) => setDi(e.target.value)}
                            />
                          ) : (
                            doc.di || 'N/A'
                          )}
                        </td>
                        <td
                          style={{
                            padding: '10px',
                            textAlign: 'left',
                          }}
                        >
                          <>
                            {sellerComments[doc.id] ? (
                              sellerComments[doc.id]
                                .sort((a, b) => {
                                  if (a.timestampField < b.timestampField) {
                                    return -1;
                                  }
                                  if (a.timestampField > b.timestampField) {
                                    return 1;
                                  }
                                  return 0;
                                })
                                .map((comment, commentIndex) => (
                                  <span
                                    className="d-block comment-text"
                                    key={commentIndex}
                                  >
                                    {comment.text}
                                  </span>
                                ))
                            ) : (
                              <>
                                <button
                                  className="btn btn-outline-secondary m-auto mt-2 d-block d-flex gap-1 align-items-center"
                                  onClick={() => loadComments(doc.id)}
                                  style={{ padding: '4px 9px' }}
                                >
                                  Show
                                  <lord-icon
                                    src="https://cdn.lordicon.com/ccrgnftl.json"
                                    trigger="hover"
                                    colors="primary:#3a3347,secondary:#4bb3fd,tertiary:#f9c9c0,quaternary:#f24c00,quinary:#e4e4e4"
                                    style={{ width: '23px', height: '23px' }}
                                  ></lord-icon>
                                </button>
                              </>
                            )}
                          </>
                        </td>

                        <td style={{ padding: '10px', textAlign: 'left' }}>
                          {editMode && sellerDataId === doc.id ? (
                            <>
                              <select
                                value={status}
                                className="form-control border border-secondary"
                                style={{ padding: '4px 3px' }}
                                onChange={(e) => setStatus(e.target.value)}
                                name="selectStatus"
                              >
                                <option value="" className="text-secondary">
                                  Select Status
                                </option>
                                <option value="Email Sent to Seller for Catalog">
                                  Email Sent to Seller for Catalog
                                </option>
                                <option value="Email Sent for Missing Details to Seller">
                                  Email Sent for Missing Details to Seller
                                </option>
                                <option value="Email Sent to FOS/RM for Catalog">
                                  Email Sent to FOS/RM for Catalog
                                </option>
                                <option value="Email Sent for FAP">
                                  Email Sent for FAP
                                </option>
                                <option value="Completed">Completed</option>
                                <option value="SKU Addition is WIP">
                                  SKU Addition is WIP
                                </option>
                                <option value="No Catalog Received from FOS/RM">
                                  No Catalog Received from FOS/RM
                                </option>
                              </select>
                              {statusError && (
                                <p className="text-danger">
                                  Status is required
                                </p>
                              )}
                            </>
                          ) : (
                            doc.status
                          )}
                        </td>

                        <td
                          style={{ padding: '10px', textAlign: 'left' }}
                          className="d-flex align-items-center"
                        >
                          {editMode && sellerDataId === doc.id ? (
                            <>
                              {/* Save Button */}
                              <button
                                className="border-0 bg-transparent"
                                onClick={(e) => {
                                  handleSubmit(e);
                                }}
                              >
                                <button className="bookmarkBtn">
                                  <span className="IconContainer">
                                    <svg
                                      viewBox="0 0 384 512"
                                      height="0.9em"
                                      className="icon"
                                    >
                                      <path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z"></path>
                                    </svg>
                                  </span>
                                  <p className="text m-0">Save</p>
                                </button>
                              </button>
                            </>
                          ) : (
                            <>
                              <Dropdown
                                className={`${
                                  showDeleteChecks ? 'd-none' : null
                                }`}
                              >
                                <Dropdown.Toggle
                                  variant="secondary"
                                  id="dropdown-basic"
                                  className="px-2 d-flex align-items-center justify-content-center"
                                >
                                  <IoSettingsSharp />
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                  <>
                                    <Dropdown.Item>
                                      <button
                                        className="px-2 border-0 bg-transparent"
                                        onClick={() => {
                                          setComments('');
                                          handleShow();
                                          getSellerDataHandler(doc.id);
                                        }}
                                      >
                                        <TfiCommentAlt
                                          style={{
                                            width: '24px',
                                            height: '21px',
                                            color: '#5b5bce',
                                            marginBottom: '5px',
                                          }}
                                        />
                                      </button>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                      <button
                                        className="border-0 bg-transparent"
                                        onClick={() => {
                                          getSellerDataHandler(doc.id);
                                          setEditMode(true);
                                        }}
                                      >
                                        <lord-icon
                                          src="https://cdn.lordicon.com/oqaajvyl.json"
                                          stroke="bold"
                                          trigger="click"
                                          colors="primary:blue,secondary:gray,tertiary:navy,quaternary:blue"
                                          style={{
                                            width: '25px',
                                            height: '25px',
                                          }}
                                        ></lord-icon>
                                      </button>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                      <button
                                        className="border-0 bg-transparent"
                                        onClick={() => {
                                          // setSellerDataId(doc.id);
                                          // handleDeleteModalShow();
                                          setShowDeleteChecks(true);
                                        }}
                                      >
                                        <lord-icon
                                          src="https://cdn.lordicon.com/vlnvqvew.json"
                                          stroke="bold"
                                          colors="primary:blue,secondary:gray,tertiary:navy,quaternary:blue"
                                          trigger="hover"
                                          style={{
                                            width: '24px',
                                            height: '24px',
                                          }}
                                        ></lord-icon>
                                      </button>
                                    </Dropdown.Item>
                                  </>
                                </Dropdown.Menu>
                              </Dropdown>
                              <button
                                className={`border-0 bg-transparent ${
                                  showDeleteChecks ? 'd-block' : 'd-none'
                                }`}
                                onClick={() => {
                                  setSellerDataId(doc.id);
                                  handleDeleteModalShow();
                                }}
                              >
                                <lord-icon
                                  src="https://cdn.lordicon.com/vlnvqvew.json"
                                  stroke="bold"
                                  colors="primary:blue,secondary:gray,tertiary:navy,quaternary:blue"
                                  trigger="hover"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                  }}
                                ></lord-icon>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    </>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="my-5 py-3 text-center fs-3">
                    No data found...
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Got to bottom button */}
          <a name="bottom"></a>
          <div
            className="position-fixed bottom-btn"
            style={{
              bottom: '3%',
              right: '1.5%',
              borderRadius: '50px',
              backdropFilter: 'blur(1.3px) saturate(199%)',
              WebkitBackdropFilter: 'blur(3.5px) saturate(200%)',
              backgroundColor: '#00000078',
              padding: '1px 11px 7px',
              transition: '.3s',
            }}
          >
            <a href="#bottom" className="text-decoration-none fs-4 text-white">
              <BsChevronDoubleDown />
            </a>
          </div>
        </section>

        {/* Add Comment Modal */}
        <Modal show={show} onHide={handleClose}>
          <Modal.Body>
            <Form>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  autoFocus
                  onChange={(e) => {
                    setComments(e.target.value);
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                handleCommentUpdate();
                handleClose();
              }}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal
          show={showDeleteModal}
          onHide={handleDeleteModalClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Body>This action is irreversible</Modal.Body>
          <Modal.Footer className="p-1">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteChecks(false);
                handleDeleteModalClose();
              }}
            >
              Close
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteHandler();
                handleDeleteModalClose();
                setShowDeleteChecks(false);
              }}
            >
              Confirm Delete
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Updation Modal */}
        <Modal
          show={showUpdationModal}
          onHide={handleUpdationModalClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton className="bg-dark bg-opacity-75">
            <Modal.Title className="fs-5 text-light">
              Upload Xcel file to update FAP/Live/DI
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-secondary bg-opacity-50">
            <div className="my-3">
              <form onSubmit={handleUpdatingData}>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileForUpdatingData}
                  className="form-control w-75 m-auto p-1"
                />
                <button
                  type="submit"
                  className="btn btn-success border d-block my-4 m-auto"
                >
                  Update!
                </button>
              </form>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
export default App;
