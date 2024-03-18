import { useEffect, useState } from 'react';
import { account, databases } from '../appwrite/appwrite-config';
import { Query } from "appwrite";
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import Header from './Header';
import '../index.css';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Dropdown from 'react-bootstrap/Dropdown';

import { IoSettingsSharp } from 'react-icons/io5';
import { TfiCommentAlt } from 'react-icons/tfi';
import { BsChevronDoubleDown } from 'react-icons/bs';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Signup from './Signup';
import Login from './Login';

const HomePage = () => {
  const [adminEmail, setAdminEmail] = useState();
  const [entityName, setEntityName] = useState('');
  const [entityID, setEntityID] = useState();
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState('');
  const [cataloguer, setCataloguer] = useState('Select Cataloguer');
  const [onboarding, setOnboarding] = useState('');
  const [allocation, setAllocation] = useState('');
  const [publish, setPublish] = useState('');
  const [fap, setFap] = useState(0);
  const [live, setLive] = useState(0);
  const [di, setDi] = useState(0);
  const [category, setCategory] = useState('');

  const [sellerData, setSellerData] = useState();
  const [filteredSellerData, setFilteredSellerData] = useState([]);
  const [sellerDataId, setSellerDataId] = useState();
  const [multipleDeleteSellerDataId, setMultipleDeleteSellerDataId] = useState(
    []
  );
  const [editMode, setEditMode] = useState(false);
  const [showDeleteChecks, setShowDeleteChecks] = useState(false);
  const [isImportingFile, setIsImportingFile] = useState();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileForUpdatingData, setFileForUpdatingData] = useState(null);
  const [isSearchDataFound, setIsSearchDataFound] = useState(false);
  const [searchCataloguer, setSearchCataloguer] = useState('');
  const [searchPublish, setSearchPublish] = useState('');
  const [statusError, setStatusError] = useState(false);

  // Singup Modal
  const [showSignupModal, setSignupModal] = useState(false);
  const handleSingupModalClose = () => setSignupModal(false);
  const handleSignupModalShow = () => setSignupModal(true);

  // Login Modal
  const [showLoginModal, setLoginModal] = useState(false);
  const handleLoginModalClose = () => setLoginModal(false);
  const handleLoginModalShow = () => setLoginModal(true);

  // Seller Form Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const handleFormModalClose = () => setShowFormModal(false);
  const handleFormModalShow = () => setShowFormModal(true);

  // Comment Modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleDeleteModalClose = () => setShowDeleteModal(false);
  const handleDeleteModalShow = () => setShowDeleteModal(true);

  // Updation Modal
  const [showUpdationModal, setShowUpdationModal] = useState(false);
  const handleUpdationModalClose = () => setShowUpdationModal(false);
  const handleUpdationModalShow = () => setShowUpdationModal(true);

  // Getting the account details if user is logged in
  useEffect(() => {
    const getData = account.get();
    getData.then(
      function (response) {
        setAdminEmail(response.email);
      },
      function (error) {
        console.error(error);
      }
    );
  }, []);

  // Fetching the data and populating UI
  useEffect(() => {
    getData();
    setFilteredSellerData(sellerData);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const calculateCategory = (live, di) => {
      if (live === 0) {
        return 'Non-Live';
      }
      if (live > 0 && live <= 3) {
        return 'Low SKUs';
      }
      if (di === 1) {
        return "Low DI's";
      }
      return 'Uncategorised';
    };

    const existingEntityID = sellerData.find(
      (seller) => seller.entityID === entityID
    );
    
    const newSellerData = {
      entityName,
      entityID,
      onboarding,
      allocation,
      publish,
      fap: fap || 0,
      live: live || 0,
      di: di || 0,
      status,
      cataloguer,
      category: calculateCategory(live, di),
    };

    if (!existingEntityID) {
      // Add New SellerData
      const promise = databases.createDocument(
        '65f058795179029c97a7',
        '65f058bdc26797558fcf',
        uuidv4(),
        newSellerData
      );
      toast
        .promise(promise, {
          pending: 'Adding Data...',
          success: 'A New Seller Added! 👌',
          error: 'Error Adding A New Seller 🤯',
        })
        .then(
          function (response) {
            getData();
            console.log(response)
          },
          function (error) {
            console.error(error);
            const errorNotify = () => toast.error(`${error}`);
            errorNotify();
          }
        );
    } else {
      const errorNotify = () =>
        toast.error(
          'Seller With Same Entity ID Already Exists! ' +
            existingEntityID.entityName +
            ' - ' +
            existingEntityID.entityID
        );
      errorNotify();
    }
    handleFormModalClose();
    resetForm();
  };

  const handleCommentUpdate = () => {
    const currentDate = new Date().toLocaleDateString('en-GB');
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const fullDateTime = `${currentDate}, ${currentTime}`;
    const commentWithDate = `${fullDateTime} - ${comments}`;

    // Fetch the document to be updated
    databases
      .getDocument(
        '65f058795179029c97a7', // Database ID
        '65f058bdc26797558fcf', // Collection ID
        sellerDataId
      )
      .then(
        (response) => {
          console.log(response);
          const existingComments = response.comments || [];
          const updatedComments = [...existingComments, commentWithDate];

          // Update the document with the modified comments array
          const promise = databases.updateDocument(
            '65f058795179029c97a7', // Database ID
            '65f058bdc26797558fcf', // Collection ID
            sellerDataId,
            { comments: updatedComments }
          );
          toast
            .promise(promise, {
              pending: 'Adding Comment...',
              success: 'Comment Added Successfully! 👌',
              error: 'Error Adding New Comment 🤯',
            })
            .then(
              (updateResponse) => {
                getData();
              },
              (updateError) => {
                console.error('Error updating comments:', updateError);
                const errorNotify = () => toast.error(`${updateError}`);
                errorNotify();
              }
            );
        },
        (error) => {
          const errorNotify = () =>
            toast.error('Error fetching document:', error);
          errorNotify();
          console.error('Error fetching document:', error);
        }
      );
    resetForm();
  };

  const handleEdit = () => {
    const calculateCategory = (live,di) => {
      if (live === 0) {
        return 'Non-Live';
      }
      if (live > 0 && live <= 3) {
        return 'Low SKUs';
      }
      if (di === 1) {
        return "Low DI's";
      }
      return 'Uncategorised';
    };

    if (!status) {
      setStatusError(true);
      return;
    } else if (status) {
      setStatusError(false);
      const obj = {
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
        category: category === 'Paid Seller' ? category : calculateCategory(live, di),
      }
      const promise = databases.updateDocument(
        '65f058795179029c97a7', // Database ID
        '65f058bdc26797558fcf', // Collection ID
        sellerDataId,
        obj
      );
      toast
        .promise(promise, {
          pending: 'Editing Data...',
          success: 'Data Edited Successfully! 👌',
          error: 'Error Editing Data 🤯',
        })
        .then(
          (updateResponse) => {
            getData();
          },
          (updateError) => {
            const errorNotify = () => toast.error(`${updateError}`);
            errorNotify();
            console.error('Error updating data:', updateError);
          }
        );
    }
    setEditMode(false);
  };
  // Populating the form fields with the existing data for editing
  useEffect(() => {
    sellerData &&
      sellerData.filter((data) => {
        if (data.$id === sellerDataId) {
          setEntityName(data.entityName || '');
          setEntityID(data.entityID || '');
          setOnboarding(data.onboarding || '');
          setAllocation(data.allocation || '');
          setPublish(data.publish || '');
          setFap(data.fap || 0);
          setLive(data.live || 0);
          setDi(data.di || 0);
          setStatus(data.status);
          setCataloguer(data.cataloguer || 'Select Cataloguer');
          setCategory(data.category || 'Uncategorized');
        }
      });
  }, [editMode]);

  const getData = () => {
    const promise = databases.listDocuments(
      '65f058795179029c97a7',
      '65f058bdc26797558fcf',
      [
        Query.limit(100000),
      ]
    );

    promise.then(
      function (response) {
        setSellerData(response.documents);
        setFilteredSellerData(response.documents);
      },
      function (error) {
        console.error(error);
        const errorNotify = () => toast.error(`${error}`);
        errorNotify();
      }
    );
  };

  const deleteHandler = () => {
    let hasDeleted = false;
    multipleDeleteSellerDataId.map((id) => {
      const promise = databases.deleteDocument(
        '65f058795179029c97a7', // Database ID
        '65f058bdc26797558fcf', // Collection ID
        id
      );
      if (!hasDeleted) {
        hasDeleted = true;
        toast
          .promise(promise, {
            pending: 'Deleting Data...',
            success: 'Deleted Successfully! 👌',
            error: 'Error Deleting Data 🤯',
          })
          .then(
            (response) => {
              getData();
              setSellerDataId('');
            },
            (error) => {
              const errorNotify = () => toast.error(`${error}`);
              errorNotify();
              console.log('Error deleting the data: ' + error);
            }
          );
      }
    });
    resetForm();
  };
  useEffect(() => {
    console.log('Selection is going on...');
  }, [multipleDeleteSellerDataId]);

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
    setUploadedFile(null);
    setFileForUpdatingData(null);
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
    let hasAdded = false;
    let hasEntityError = false;

    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        const arr = [];

        const calculateCategory = (item) => {
          if (item.live === 0) {
            return 'Non-Live';
          }
          if (item.live > 0 && item.live <= 3) {
            return 'Low SKUs';
          }
          if (item.di === 1) {
            return "Low DI's";
          }
          return 'Uncategorised';
        };

        parsedData.map((item) => {
          const categoryFnc = calculateCategory(item);
          const obj = {
            entityName: item['Entity Name'] || 'N/A',
            entityID: item['Entity ID'] || 'N/A',
            cataloguer: item.Cataloguer || 'N/A',
            onboarding: ExcelDateToJSDate(item.Onboarding) || 'N/A',
            allocation: ExcelDateToJSDate(item.Allocation) || 'N/A',
            publish: ExcelDateToJSDate(item.Publish) || 'N/A',
            fap: item.FAP || 0,
            live: item.Live || 0,
            di: item.DI || 0,
            status: item.Status || '',
            category: categoryFnc,
            comments: [],
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
              if (!hasEntityError) {
                hasEntityError = true;
                const errorNotify = () =>
                  toast.error(
                    'Seller With Same Entity ID Already Exists! ' +
                      existingEntityID.entityName +
                      ' - ' +
                      existingEntityID.entityID
                  );
                errorNotify();
              }
            } else {
              const promise = databases.createDocument(
                '65f058795179029c97a7',
                '65f058bdc26797558fcf',
                uuidv4(),
                newSellerObj
              );
              if (!hasAdded) {
                hasAdded = true;
                toast
                  .promise(promise, {
                    pending: 'Adding Data...',
                    success: 'New Seller Added! 👌',
                    error: 'Error Occured While Adding New Seller 🤯',
                  })
                  .then(
                    function (response) {
                      getData();
                      console.log(response)
                    },
                    function (error) {
                      console.log('Error adding data: ')
                      console.log(error);
                      const errorNotify = () => toast.error(`${error}`);
                      errorNotify();
                    }
                  );
              }
            }
          } catch (err) {
            const errorNotify = () => toast.error('Error Adding New Sellers ' + `${err}`);
            errorNotify();
            console.log('Error Adding New Sellers' + err);
          }
        });

        getData();
        handleFormModalClose();
        resetForm();
      };
      reader.readAsBinaryString(uploadedFile);
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
        let hasUnmatchedEntity = false;
        let hasUpdated = false;

        parsedData.map((parsedSeller) => {
          sellerData.filter(async (seller) => {
            try {
              if (
                String(seller.entityID) === String(parsedSeller['Entity ID'])
              ) {
                const calculateCategory = () => {
                  if (parsedSeller.live === 0) {
                    return 'Non-Live';
                  }
                  if (parsedSeller.live > 0 && parsedSeller.live <= 3) {
                    return 'Low SKUs';
                  }
                  if (parsedSeller.di === 1) {
                    return "Low DI's";
                  }
                  return 'Uncategorised';
                };
                const categoryFnc = calculateCategory();

                const promise = databases.updateDocument(
                  '65f058795179029c97a7', // Database ID
                  '65f058bdc26797558fcf', // Collection ID
                  seller.$id,
                  {
                    fap: parsedSeller.FAP || seller.fap || 0,
                    live: parsedSeller.Live || seller.live || 0,
                    di: parsedSeller.DI || seller.di || 0,
                    onboarding: parsedSeller.Onboarding || seller.onboarding || '',
                    allocation: parsedSeller.Allocation || seller.allocation || '',
                    publish: parsedSeller.Publish || seller.publish || '',
                    category:
                      seller.category === 'Paid Seller'
                        ? seller.category
                        : categoryFnc,
                  }
                );
                if (!hasUpdated) {
                  hasUpdated = true;
                  toast
                    .promise(promise, {
                      pending: 'Data updation is pending...',
                      success: 'Data Updated Successfully! 👌',
                      error: 'Error Occured While Updating Data 🤯',
                    })
                    .then(
                      function (response) {
                        getData();
                      },
                      function (error) {
                        console.error(error);
                        const errorNotify = () => toast.error(`${error}`);
                        errorNotify();
                      }
                    );
                }
                resetForm();
                handleUpdationModalClose();
              } else {
                if (!hasUnmatchedEntity) {
                  hasUnmatchedEntity = true;
                  const errorNotify = () =>
                    toast.error(
                      'No matching Entity ID found in the uploaded file!'
                    );
                  errorNotify();
                }
              }
            } catch (err) {
              const errorNotify = () =>
                toast.error(
                  'An error occurred while updating the data. ' + `${err}`
                );
              errorNotify();
              console.error('Error while updating the FAP/Live/DI', err);
            }
          });
        });
      };
      reader.readAsBinaryString(fileForUpdatingData);
      handleUpdationModalClose();
    } else {
      const errorNotify = () =>
        toast.error('Please upload file in Excel format, or try again later!');
      errorNotify();
    }
  };

  const handleCategoryChange = async (id, newCategory) => {
    try {
      sellerData.filter((item) => {
        if (item.$id === id) {
          const promise = databases.updateDocument(
            '65f058795179029c97a7', // Database ID
            '65f058bdc26797558fcf', // Collection ID
            id,
            { category: newCategory }
          );
          toast
            .promise(promise, {
              pending: 'Changing Category...',
              success: 'Category Changed Successfully! 👌',
              error: 'Error Occured While Changing Category 🤯',
            })
            .then(
              function (response) {
                getData();
              },
              function (error) {
                const errorNotify = () =>
                  toast.error('Error updating category ' + `${error}`);
                errorNotify();
                console.log('Error updating category', error);
              }
            );
        }
      });
    } catch (err) {
      console.error('Error updating seller category:', err);
      const errorNotify = () =>
        toast.error('Error updating seller category:', `${err}`);
      errorNotify();
    }
  };

  return (
    <>
      <Header
        setShowFormModal={setShowFormModal}
        resetForm={resetForm}
        handleUpdationModalShow={handleUpdationModalShow}
        getData={getData}
        setFilteredSellerData={setFilteredSellerData}
        filteredSellerData={filteredSellerData}
        isSearchDataFound={isSearchDataFound}
        setIsSearchDataFound={setIsSearchDataFound}
        searchCataloguer={searchCataloguer}
        setSearchCataloguer={setSearchCataloguer}
        searchPublish={searchPublish}
        setSearchPublish={setSearchPublish}
        handleSignupModalShow={handleSignupModalShow}
      />
      {/* FormModal */}
      <Offcanvas show={showFormModal} onHide={handleFormModalClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Add New Seller</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex gap-3 justify-content-center mb-1 border-bottom w-100 pb-2">
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

              <button className="add-button rounded-3 ms-1 mt-2" type="submit">
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

          {/* Copyright */}
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

      <div>
        <ToastContainer />
      </div>

      <main>
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
                  <th style={{ padding: '15px 25px', textAlign: 'left' }}>
                    Select
                  </th>
                ) : null}
                <th
                  style={{ padding: '15px 25px', textAlign: 'left' }}
                  key={'#' + Math.floor(Math.random() * 1000000)}
                >
                  #
                </th>
                <td style={{ padding: '15px 25px', textAlign: 'left' }}>
                  {/* Entity Name */}
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
                </td>
                <td style={{ padding: '15px 11px', textAlign: 'left' }}>
                  Entity ID
                </td>
                <td style={{ padding: '15px 25px', textAlign: 'left' }}>
                  Cataloguer
                </td>
                <td style={{ padding: '15px 25px', textAlign: 'left' }}>
                  Onboarding
                </td>
                <td style={{ padding: '15px 25px', textAlign: 'left' }}>
                  Allocation
                </td>
                <td style={{ padding: '15px 25px', textAlign: 'left' }}>
                  Publish
                </td>
                <td style={{ padding: '15px 25px', textAlign: 'left' }}>Fap</td>
                <td style={{ padding: '15px 25px', textAlign: 'left' }}>
                  Live
                </td>
                <td style={{ padding: '15px 25px', textAlign: 'left' }}>DI</td>
                <td style={{ padding: '15px 25px', textAlign: 'left' }}>
                  Comments
                </td>
                <td style={{ padding: '15px 25px', textAlign: 'left' }}>
                  Status
                </td>
                <td style={{ padding: '15px 25px', textAlign: 'left' }}>
                  Action
                </td>
              </tr>
            </thead>
            <tbody>
              {filteredSellerData?.length > 0 ? (
                filteredSellerData.map((seller, index) => {
                  return (
                    <tr
                      key={seller.$id}
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
                              handleSelectionClick(e, seller.$id);
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
                        {editMode && sellerDataId === seller.$id ? (
                          <input
                            type="text"
                            className="form-control border border-secondary py-1"
                            placeholder="Entity Name"
                            value={entityName}
                            onChange={(e) => setEntityName(e.target.value)}
                          />
                        ) : (
                          <>
                            <span>{seller.entityName || 'N/A'} </span>
                            <br />
                            <Dropdown>
                              <Dropdown.Toggle
                                variant={`${
                                  seller.category == 'Uncategorised'
                                    ? 'secondary'
                                    : seller.category == 'Paid Seller'
                                    ? 'success'
                                    : 'warning'
                                }`}
                                id="category-dropdown"
                                style={{
                                  fontSize: '12px',
                                  padding: '2px 3px',
                                }}
                              >
                                {seller.category || ''}
                              </Dropdown.Toggle>
                              {seller.category === 'Paid Seller' ? null : (
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
                                            seller.$id,
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
                        {editMode && sellerDataId === seller.$id ? (
                          <input
                            type="text"
                            className="form-control border border-secondary py-1"
                            placeholder="Entity ID"
                            value={entityID}
                            onChange={(e) => setEntityID(e.target.value)}
                          />
                        ) : (
                          seller.entityID
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'left' }}>
                        {editMode && sellerDataId === seller.$id ? (
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
                          seller.cataloguer
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {editMode && sellerDataId === seller.$id ? (
                          <input
                            type="text"
                            className="form-control border border-secondary py-1"
                            placeholder="Onboarding"
                            value={onboarding}
                            onChange={(e) => setOnboarding(e.target.value)}
                          />
                        ) : (
                          seller.onboarding
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {editMode && sellerDataId === seller.$id ? (
                          <input
                            type="text"
                            className="form-control border border-secondary py-1"
                            placeholder="Allocation"
                            value={allocation}
                            onChange={(e) => setAllocation(e.target.value)}
                          />
                        ) : (
                          seller.allocation
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {editMode && sellerDataId === seller.$id ? (
                          <input
                            type="text"
                            className="form-control border border-secondary py-1"
                            placeholder="Publish"
                            value={publish}
                            onChange={(e) => setPublish(e.target.value)}
                          />
                        ) : (
                          seller.publish
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {editMode && sellerDataId === seller.$id ? (
                          <input
                            type="text"
                            className="form-control border border-secondary py-1"
                            placeholder="FAP"
                            value={fap}
                            onChange={(e) => setFap(e.target.value)}
                          />
                        ) : (
                          seller.fap
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {editMode && sellerDataId === seller.$id ? (
                          <input
                            type="text"
                            className="form-control border border-secondary py-1"
                            placeholder="Live"
                            value={live}
                            onChange={(e) => setLive(e.target.value)}
                          />
                        ) : (
                          seller.live
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {editMode && sellerDataId === seller.$id ? (
                          <input
                            type="text"
                            className="form-control border border-secondary py-1"
                            placeholder="DI"
                            value={di}
                            onChange={(e) => setDi(e.target.value)}
                          />
                        ) : (
                          seller.di
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'left' }}>
                        {seller.comments.map((item, index) => {
                          return (
                            <span className="d-block comment-text" key={index}>
                              {item}
                            </span>
                          );
                        })}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'left' }}>
                        {editMode && sellerDataId === seller.$id ? (
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
                              <p className="text-danger">Status is required</p>
                            )}{' '}
                          </>
                        ) : (
                          seller.status
                        )}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'left' }}>
                        {editMode && sellerDataId === seller.$id ? (
                          <button
                            className="border-0 bg-transparent"
                            onClick={handleEdit}
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
                                className="px-2 d-flex align-items-center justify-content-center m-auto"
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
                                        setSellerDataId(seller.$id);
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
                                        setEditMode(true);
                                        setSellerDataId(seller.$id);
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
                                  {adminEmail === 'lokesh5551@gmail.com' || 'salvikishan833@gmail.com' ? (
                                    <Dropdown.Item>
                                      <button
                                        className="border-0 bg-transparent"
                                        onClick={() => {
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
                                  ) : null}
                                </>
                              </Dropdown.Menu>
                            </Dropdown>
                            <button
                              className={`border-0 bg-transparent ${
                                showDeleteChecks ? 'd-block' : 'd-none'
                              }`}
                              onClick={() => {
                                setSellerDataId(seller.$id);
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="my-5 py-3 text-center fs-3">
                    <img
                      src="https://www.archanaprojects.com/Frontend/images/not-found.png"
                      alt="No Data Found"
                      className="w-25 m-auto d-block my-5"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Signup Modal */}
          <Signup
            showSignupModal={showSignupModal}
            handleSingupModalClose={handleSingupModalClose}
            handleFormModalShow={handleFormModalShow}
            handleLoginModalShow={handleLoginModalShow}
          />

          <Login
            showLoginModal={showLoginModal}
            handleLoginModalClose={handleLoginModalClose}
            handleSignupModalShow={handleSignupModalShow}
          />

          {/* Got to bottom button */}
          <a name="bottom"></a>
          <div
            className="position-fixed bottom-btn"
            style={{
              bottom: '2%',
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
              Update Data
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-secondary bg-opacity-50">
            <p className='fw-bold m-0 mt-2' style={{fontSize: '18px'}}>The Xcel file should have same header as below:</p>
            <p className='m-0 p-0 fw-semibold mb-4' style={{fontSize: '14px'}}><span className='text-danger'>Entity ID</span> | FAP | Live | DI | Allocation | Onboarding | Publish</p>
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
      </main>
    </>
  );
};

export default HomePage;