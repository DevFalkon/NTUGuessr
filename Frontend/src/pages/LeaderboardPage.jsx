import { useEffect, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TextField,
  Paper,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import groupConfig from '../config/groupConfig.json';

// Map clan value -> color
const groupColorsMap = Object.fromEntries(
  groupConfig.groups.map(clan => [clan.name, clan.color])
);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Leaderboard() {
  const [tab, setTab] = useState(0);
  const [players, setPlayers] = useState([]);
  const [groupRankings, setGroupRankings] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/leaderboard`, {
      method: 'POST',
    })
      .then(res => res.json())
      .then(data => {

        setPlayers(data.players);
        setFilteredPlayers(data.players);

        setGroupRankings(data.clans);
      })
      .catch(err => console.error('Failed to fetch leaderboard:', err));
  }, []);

  useEffect(() => {
    if (searchUser.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(player =>
        player.username.toLowerCase().includes(searchUser.toLowerCase())
      );
      setFilteredPlayers(filtered);
    }
  }, [searchUser, players]);

  const renderTable = (data, isClan = false) => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell><b>Rank</b></TableCell>
          {isClan ? (
            <>
              <TableCell><b>Group</b></TableCell>
              <TableCell><b>Total Score</b></TableCell>
            </>
          ) : (
            <>
              <TableCell><b>Username</b></TableCell>
              <TableCell><b>Group</b></TableCell>
              <TableCell><b>High Score</b></TableCell>
            </>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((entry, idx) => {
          const isTop3 = isClan ? idx < 3 : entry.rank <= 3;
          const bgColor = isTop3 
            ? (isClan ? groupConfig.medalColors[idx] : groupConfig.medalColors[entry.rank-1])
            : (groupColorsMap[entry.clan] || grey[100]);

          return (
            <TableRow key={idx} sx={{ bgcolor: bgColor}}>
              {isClan ? (
                <>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{entry.clan}</TableCell>
                  <TableCell>{entry.score}</TableCell>
                </>
              ) : (
                <>
                  <TableCell>{entry.rank}</TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell>{entry.clan}</TableCell>
                  <TableCell>{entry.high_score}</TableCell>
                </>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 5, px: 2}}>
      <Typography variant="h4" align="center" gutterBottom>
        Leaderboard
      </Typography>

      <Paper sx={{
          mt: 2,
          p: 2,
          maxHeight: '70vh',   // or any height you want
          overflowY: 'auto',   // makes Paper scrollable
          // Scrollbar styling
          '&::-webkit-scrollbar': {
            width: '4px',
            height: '80%'
          },
          '&::-webkit-scrollbar-track': {
            background: '#2c2c34', // background of the track
            borderRadius: '4px',
            marginTop: '10px',
            marginBottom: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#5c6370', // thumb color
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#7f848e', // hover effect
          },
        }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
          <Tab label="Individual" />
          <Tab label="Groups" />
        </Tabs>

        {tab === 0 && (
          <Box mt={3}>
            <TextField
              label="Search username"
              variant="outlined"
              size="small"
              fullWidth
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              sx={{ mb: 2 }}
            />
            {renderTable(filteredPlayers)}
          </Box>
        )}

        {tab === 1 && (
          <Box mt={3}>
            {renderTable(groupRankings, true)}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Leaderboard;
