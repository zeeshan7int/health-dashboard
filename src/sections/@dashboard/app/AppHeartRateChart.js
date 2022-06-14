import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import { useEffect, useState } from 'react';
// @mui
import { Card, CardHeader, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// ----------------------------------------------------------------------

AppHeartRateChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartData: PropTypes.array.isRequired,
};

export default function AppHeartRateChart({ title, subheader, chartData, ...other }) {

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Box width={'100%'} sx={{ pt: 2, pb: 1, pr: 1, height:390 }} dir="ltr">
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              right: 20,
              left: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="modified_at" name="Date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="heart_rate" name="Heart Rate" stroke="#b62135" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="step_count" name="Steps" stroke="#2867b6" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
