import React from 'react';
import Table from './Table';

export default function TripTable({ data }) {
  return (
    <Table
      data={data}
      columns={[
        {
          Header: 'Destination',
          accessor: 'destination',
        },
        {
          Header: 'Start Date',
          accessor: 'start_date',
          // Cell: props => <span className='number'>{props.value}</span>
        },
        {
          Header: 'End Date',
          accessor: 'end_date',
        },
        {
          Header: 'Comment',
          accessor: 'comment',
        },
      ]}
    />
  );
}
