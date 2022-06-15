import { useEffect, useState } from 'react';
// @mui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { Grid, Container, Typography, CardHeader, Box, Card } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import moment from 'moment';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { onSnapshot, collection } from 'firebase/firestore';
import db from '../firebase';
// components
import Page from '../components/Page';
// sections
import {
  AppHeartRateChart,
  AppWidgetSummary,
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardApp() {
  const [HealthData, setHealthData] = useState(null);
  const [SelectedUser, setSelectedUser] = useState(null);
  const [UsersList, setUsersList] = useState(null);
  const [UserData, setUserData] = useState(null);
  const [UserLatestData, setUserLatestData] = useState(null);

  useEffect(() => {
    let items = [];
    const unSubscribe = onSnapshot(collection(db, 'health_data'), (querySnapshot) => {
      items = [];
      querySnapshot.docs.forEach((doc) => {
        items.push(doc.data());
      });
      setHealthData(items);
    })
    return unSubscribe;
  }, [])

  useEffect(() => {
    if (HealthData) {
      const users = new Set();
      HealthData.map(item => {
        users.add(item.device_id);
        return null;
      })
      setUsersList(Array.from(users))
    }
  }, [HealthData])

  useEffect(() => {
    if (SelectedUser) {
      const user = HealthData.filter(item => item.device_id.toString() === SelectedUser);
      user.sort((a, b) => {
        return moment(a.modified_at.seconds * 1000 + a.modified_at.nanoseconds / 1000000) - moment(b.modified_at.seconds * 1000 + b.modified_at.nanoseconds / 1000000)
      })
      setUserLatestData(user.slice(user.length - 1, user.length)[0]);
      setUserData(user.map((item) => {
        return {
          ...item,
          heart_rate: item.heart_rate.toFixed(0),
          modified_at: moment(item.modified_at.seconds * 1000 + item.modified_at.nanoseconds / 1000000).format('DD/MM/YY HH:mm'),
        }
      }))
    }
  }, [SelectedUser])

  const RemoveUser = () => {
    setSelectedUser(null);
    setUserData(null);
    setUserLatestData(null);
  }

  return (
    <Page title="Dashboard">
      {HealthData === null &&
        (<Grid item xs={12} sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 30 }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ paddingTop: 5 }}>Please wait while we load...</Typography>
          </Box>
        </Grid>)}
      {(HealthData !== null && SelectedUser === null && UsersList && (
        <div>
          <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="p" sx={{ paddingLeft: 2, fontWeight: 500, fontStyle: "italic", opacity: 0.7 }}>Select a user to view their vitals</Typography>
            <Typography variant="h7" sx={{ mr: 4, ml: 2, fontStyle: 'italic' }} >
              Total Participants {UsersList.length}
            </Typography>
          </Grid>

          <List sx={{ width: '100%', bgcolor: 'background.paper', marginTop: 2 }}>
            {UsersList && UsersList.map((user) => {
              return (
                <div key={user} data={user} onClick={(e) => { setSelectedUser(e.target.innerText) }} aria-hidden="true"><ListItem sx={{ cursor: 'pointer' }}>
                  <ListItemAvatar>
                    <Avatar />
                  </ListItemAvatar>
                  <ListItemText primary={user} />
                </ListItem><Divider variant="middle" /></div>);
            })}
          </List>
        </div>)
      )}
      {HealthData !== null && SelectedUser !== null && UserLatestData && UserData && (<Container maxWidth="xl">
        <Typography variant='a' sx={{ color: 'blue', fontSize: '0.9em', cursor: 'pointer' }} onClick={RemoveUser}>Go Back</Typography>
        <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h4">
            Hi, Welcome back
          </Typography>
          <Typography variant="h7" sx={{ mr: 4 }} >
            User {SelectedUser}
          </Typography>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Heart Rate" data={UserLatestData?.heart_rate.toFixed(0)} color="error" icon={'ant-design:heart-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Total Steps" data={UserLatestData?.step_count ? UserLatestData?.step_count : 0} color="info" icon={'ion:footsteps-sharp'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Fall Detection" data={UserLatestData?.fallDetect ? 'Enabled' : 'Disabled'} color="warning" icon={'fa6-solid:person-falling'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Pose Detection" subtitle="Use the app to detect real time body posture." data={''} icon={'mdi:human-handsup'} />
          </Grid>

          <Grid item xs={12} md={6} lg={8} >
            <AppHeartRateChart
              title="Vitals Chart Report"
              subheader={'Heart rate and steps are plotted with respect to dates.'}
              chartData={UserData}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardHeader title="Steps" subheader="Total number of steps taken in past 24 hours." />
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', pl: 4, pr: 4, pt: 4, pb: 4, height: 390, maxHeight: window.innerWidth > 440 ? 400 : 200 }} >
                <Box sx={{ width: 340 }}>
                  <CircularProgressbar
                    value={UserLatestData?.step_count}
                    maxValue={7000} text={`${UserLatestData?.step_count ? UserLatestData?.step_count : 0}/7000`}
                    styles={buildStyles({
                      strokeLinecap: 'butt',
                      textSize: '12px',
                      pathTransitionDuration: 0.5,
                      pathColor: `#0c53b7`,
                      textColor: '#04297a',
                      trailColor: '#b6dcf6',
                      backgroundColor: '#3e98c7',
                    })} />
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates
              title="Conversion Rates"
              subheader="(+43%) than last year"
              chartData={[
                { label: 'Italy', value: 400 },
                { label: 'Japan', value: 430 },
                { label: 'China', value: 448 },
                { label: 'Canada', value: 470 },
                { label: 'France', value: 540 },
                { label: 'Germany', value: 580 },
                { label: 'South Korea', value: 690 },
                { label: 'Netherlands', value: 1100 },
                { label: 'United States', value: 1200 },
                { label: 'United Kingdom', value: 1380 },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject
              title="Current Subject"
              chartLabels={['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math']}
              chartData={[
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ]}
              chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
            />
          </Grid> */}

          {/* <Grid item xs={12} md={6} lg={8}>
        <AppNewsUpdate
          title="News Update"
          list={[...Array(5)].map((_, index) => ({
            id: faker.datatype.uuid(),
            title: faker.name.jobTitle(),
            description: faker.name.jobTitle(),
            image: `/static/mock-images/covers/cover_${index + 1}.jpg`,
            postedAt: faker.date.recent(),
          }))}
        />
      </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
        <AppOrderTimeline
          title="Order Timeline"
          list={[...Array(5)].map((_, index) => ({
            id: faker.datatype.uuid(),
            title: [
              '1983, orders, $4220',
              '12 Invoices have been paid',
              'Order #37745 from September',
              'New order placed #XF-2356',
              'New order placed #XF-2346',
            ][index],
            type: `order${index + 1}`,
            time: faker.date.past(),
          }))}
        />
      </Grid> */}

          {/* <Grid item xs={12} md={6} lg={4}>
        <AppTrafficBySite
          title="Traffic by Site"
          list={[
            {
              name: 'FaceBook',
              value: 323234,
              icon: <Iconify icon={'eva:facebook-fill'} color="#1877F2" width={32} height={32} />,
            },
            {
              name: 'Google',
              value: 341212,
              icon: <Iconify icon={'eva:google-fill'} color="#DF3E30" width={32} height={32} />,
            },
            {
              name: 'Linkedin',
              value: 411213,
              icon: <Iconify icon={'eva:linkedin-fill'} color="#006097" width={32} height={32} />,
            },
            {
              name: 'Twitter',
              value: 443232,
              icon: <Iconify icon={'eva:twitter-fill'} color="#1C9CEA" width={32} height={32} />,
            },
          ]}
        />
      </Grid>

      <Grid item xs={12} md={6} lg={8}>
        <AppTasks
          title="Tasks"
          list={[
            { id: '1', label: 'Create FireStone Logo' },
            { id: '2', label: 'Add SCSS and JS files if required' },
            { id: '3', label: 'Stakeholder Meeting' },
            { id: '4', label: 'Scoping & Estimations' },
            { id: '5', label: 'Sprint Showcase' },
          ]}
        />
      </Grid> */}
        </Grid>
      </Container>)}


    </Page>
  );
}
