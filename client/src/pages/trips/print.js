import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import withAuth from '../../components/withAuth';
import withPermissions from '../../components/withPermissions';
import { ROLE } from '../../constants';
import TripTable from '../../components/TripTable';
import http from '../../utils/http';
import Header from '../../components/Header';
import { Text } from '@chakra-ui/core';

const prepDataForPrint = (data) => {
  data.sort((a, b) => (a.start_date < b.start_date ? -1 : 1));

  const rangeStart = new Date();
  const rangeEnd = new Date();
  rangeEnd.setDate(rangeStart.getDate() + 30);

  const rangeStartFormatted = [
    rangeStart.getFullYear(),
    ('0' + (rangeStart.getMonth() + 1)).slice(-2),
    ('0' + rangeStart.getDate()).slice(-2),
  ].join('/');
  const rangeEndFormatted = [
    rangeEnd.getFullYear(),
    ('0' + (rangeEnd.getMonth() + 1)).slice(-2),
    ('0' + rangeEnd.getDate()).slice(-2),
  ].join('/');

  return {
    rangeStart: rangeStartFormatted,
    rangeEnd: rangeEndFormatted,
    data: data.filter((trip) => {
      if (trip.start_date >= rangeStartFormatted && trip.start_date <= rangeEndFormatted) {
        return true;
      }

      return false;
    }),
  };
};

function TripsPrint() {
  const { data } = useQuery('trips', () => http.get('/trips'));

  useEffect(() => {
    if (data) {
      window.parent.postMessage('data-loaded');
    }
  }, [data]);

  if (data) {
    const dataForPrint = prepDataForPrint(data);

    return (
      <>
        <Header forPrint />
        <Text
          fontSize="lg"
          my="6"
        >{`Trips between ${dataForPrint.rangeStart} and ${dataForPrint.rangeEnd}:`}</Text>
        <TripTable
          data={dataForPrint.data}
          forPrint
          noDataText={`No planned trips between ${dataForPrint.rangeStart} and ${dataForPrint.rangeEnd}`}
        />
      </>
    );
  }

  return null;
}

export default withAuth(withPermissions([ROLE.USER], TripsPrint));
