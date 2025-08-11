import React, { useEffect, useState } from 'react';
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
import { amber, grey } from '@mui/material/colors';

const clanColors = {
  Dynari: '#e00b2b',
  Akrona: '#0b7de0',
  Invicta: '#e0c00b',
  Solaris: '#812196',
  Ephilia: '#2fe00b',
};

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Leaderboard() {
  const [tab, setTab] = useState(0);
  const [players, setPlayers] = useState([]);
  const [clanRankings, setClanRankings] = useState([]);
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

        setClanRankings(data.clans);
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
              <TableCell><b>Clan</b></TableCell>
              <TableCell><b>Total Score</b></TableCell>
            </>
          ) : (
            <>
              <TableCell><b>Username</b></TableCell>
              <TableCell><b>Clan</b></TableCell>
              <TableCell><b>High Score</b></TableCell>
            </>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((entry, idx) => {
          const isTop3 = idx < 3;
          const bgColor = isClan
            ? (isTop3 ? medalColors[idx] : clanColors[entry.clan])
            : (clanColors[entry.clan] || grey[100]);

          return (
            <TableRow key={idx} sx={{ bgcolor: isTop3 ? medalColors[idx] : bgColor }}>
              <TableCell>{idx + 1}</TableCell>
              {isClan ? (
                <>
                  <TableCell>{entry.clan}</TableCell>
                  <TableCell>{entry.score}</TableCell>
                </>
              ) : (
                <>
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
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 5, px: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Leaderboard
      </Typography>

      <Paper sx={{ mt: 2, p: 2 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
          <Tab label="Individual" />
          <Tab label="Clan" />
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
            {renderTable(clanRankings, true)}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Leaderboard;
