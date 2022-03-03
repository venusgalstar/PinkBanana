import { useEffect, useState } from "react";
import styled from 'styled-components';
import Switch from '@mui/material/Switch';
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import axios from "axios";
import config from "../../config";

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';


const Styles = styled.div`
  padding: 100px 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  div {

      display:flex;
      justify-content: center;
  }

  table {
    margin-top: 20px;
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      text-align:center;
      :last-child {
        border-right: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`
const Admin = () => {
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(1);
    const [itemsByPage, setItemsByPage] = useState(10);
    const [itemList, setItemList] = useState([]);
    const [searchType, setSearchType] = useState(0);
    const [keyword, setKeyword] = useState("");


    const handleChange = (event, value) => {
        setPage(value);
    };

    const getUserList = async () => {
        var data = await axios.post(`${config.baseUrl}admin/get_users`, 
                { page: page, itemsByPage: itemsByPage, keyword: keyword, searchType: searchType });
        setItemList(data.data.data);
        setCount(Math.ceil(data.data.count / itemsByPage));
    };

    const changeStatus = (event, index) => {
        var item = itemList[index];
        axios.post(`${config.baseUrl}admin/update_user_info`, { _id: item._id, verified: !item.verified }).then(() => {
            getUserList();
        }).catch(() => {

        });
    }

    useEffect(() => {
        getUserList();
        setItemsByPage(10);
    }, [page])

    return (

        <Styles>
            <div>
                <Box sx={{ minWidth: 200 }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Search Type</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={searchType}
                            label="Search Type"
                            onChange={(event) => {setSearchType(event.target.value)}}
                        >
                            <MenuItem value={0}>NickName</MenuItem>
                            <MenuItem value={1}>Wallet Address</MenuItem>
                            <MenuItem value={2}>Phone Number</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <TextField id="outlined-basic" label="Input" variant="outlined" sx={{minWidth:300}} onChange={(event)=>{setKeyword(event.target.value); getUserList();}} />
                <Button variant="outlined" onClick={getUserList}>SEARCH</Button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Nickname</th>
                        <th>Wallet Address</th>
                        <th>Email</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {itemList.map((row, index) => {
                        return (
                            <tr key={index}>
                                <td>{(page - 1) * itemsByPage + index + 1}</td>
                                <td>{row.nickname}</td>
                                <td>{row.address}</td>
                                <td>{row.email}</td>
                                <td><Switch checked={row.verified} onChange={(event) => { changeStatus(event, index) }} /></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Stack spacing={2}>
                <Pagination count={count} page={page} onChange={handleChange} />
            </Stack>
        </Styles>

    );

}

export default Admin;
