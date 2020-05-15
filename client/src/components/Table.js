import React from 'react';
import ReactTable from 'react-table-v6';

export default function Table(props) {
  return (
    <ReactTable
      data={props.data}
      columns={props.columns}
      showPagination={false}
      loading={false}
      pageSize={props.data.length}
      noDataText={props.noDataText}
    />
  );
}
