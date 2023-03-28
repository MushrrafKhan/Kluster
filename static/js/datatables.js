$(document).ready(() => {
  let id=$('#stageIdLevel').val()
  $('#levelList-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: `/game/levelList/${id}`,
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#stage-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '33%' },
      { width: '33%' },
      { width: '33%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/game/stageList',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#game-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/game/list',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#pages-datatable').DataTable({
    aoColumnDefs: [
      {
        bSortable: false,
        aTargets: [-1],
      },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/pages/list',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="mdi mdi-chevron-left">',
        next: '<i class="mdi mdi-chevron-right">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#plans-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/plans/list',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#rewards-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/reward/list',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#user-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/user/list',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#characteristics-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/characteristics/list',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#education-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/education/list',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#question-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '33%' },
      { width: '33%' },
      { width: '33%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/question/list',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#tutorial-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '20%' },
      { width: '20%' },
      { width: '20%' },
      { width: '20%' },
      { width: '20%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/tutorial/list',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#romantiks-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/romantiks/list',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#notification-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/sound/notificationList',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#background-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '20%' },
      { width: '20%' },
      { width: '20%' },
      { width: '20%' },
      { width: '20%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/sound/backgroundList',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#puzzle-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '20%' },
      { width: '20%' },
      { width: '20%' },
      { width: '20%' },
      { width: '20%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/sound/puzzleList',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
  $('#hint-datatable').DataTable({
    aoColumnDefs: [
      {
        defaultContent: '-',
        targets: '_all',
      },
    ],
    columns: [
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
      { width: '25%' },
    ],
    stateSave: true,
    searchDelay: 700,
    aaSorting: [[0, 'desc']],
    processing: true,
    serverSide: true,
    ajax: {
      url: '/game/hintList',
      data: {},
    },
    initComplete: (settings, json) => {
      $('.tableLoader').css('display', 'none')
    },
    language: {
      paginate: {
        previous: '<i class="ion-arrow-left-a">',
        next: '<i class="ion-arrow-right-a">',
      },
    },
    drawCallback: () => {
      $('.dataTables_paginate > .pagination').addClass('pagination-rounded')
    },
  })
 
})
