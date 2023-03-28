$(document).ready(function () {
    $('.summernote').length && $('.summernote').summernote({
        height: 250,
        minHeight: null,
        maxHeight: null,
        focus: !1,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['insert', ['link', 'hr']],
            ['misc', ['undo', 'redo', 'fullscreen', 'codeview']]
        ]
    });

    $('#range-datepicker').flatpickr({
        mode: 'range',
        maxDate: new Date(),
    });
    
    function formatState (opt) {
        if (!opt.id) {
            return opt.text.toUpperCase();
        }

        const optImage = $(opt.element).attr('data-image');
        if(!optImage){
            return opt.text.toUpperCase();
        }
        return $(
            `<span><img src="${optImage}" width="30px" />${opt.text.toUpperCase()}</span>`
        );
    }

    if ($('.select2').length) {
        $('.select2').select2({
            templateResult: formatState,
            templateSelection: formatState
        });
        $('.select2').on('change', (e) => {
            if (e.target.value) {
                $('.select2').siblings('.text-danger').css('display', 'none');
            }else{
                $('.select2').siblings('.text-danger').css('display', 'block');
            }
        });
    }

    if ($('.select2-multiple').length) {
        $('.select2-multiple').select2({
            templateResult: formatState,
            templateSelection: formatState
        });
        $('.select2-multiple').on('change', (e) => {
            if (e.target.value) {
                $('.select2-multiple').siblings('.text-danger').css('display', 'none');
            }else{
                $('.select2-multiple').siblings('.text-danger').css('display', 'block');
            }
        });
    }

    $('#fromDate').flatpickr({
        minDate: new Date(),
    });

    $('#fromDate').on('change', () => {
        if ($('#toDate').length) {
            $('#toDate').removeAttr('readonly').val('');
            $('#toDate').flatpickr({
                minDate: $('#fromDate').val(),
            });
        }
    });

    $('.niceSelect').niceSelect();
});
// Delete Item
$(document).on('click', '.deleteUserItem', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to delete this user?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.deleteSoundItem', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to delete this sound?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.deleteRomantiksItem', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to delete this Romantiks Gif?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.deleteQuestionItem', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to delete this Questions?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.deleteEducationItem', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to delete this Education?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.deleteHintItem', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure to delete this Hint?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.deleteCharacteristicItem', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to delete this Characteristic?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.deleteTutorialItem', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to delete this Tutorial?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});

// Update status Item
$(document).on('click', '.characteristicActiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to active this Characteristic?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.characteristicInactiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to In-active this Characteristic?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.educationActiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to active this education?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.educationInactiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to In-active this education?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.hintActiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to active this hint?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.hintInactiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to In-active this hint?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.questionActiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to active this question?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.questionInactiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to In-active this question?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.romantiksActiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to active this romantiks?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.romantiksInactiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to In-active this romantiks?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.soundActiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to active this sound?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.soundInactiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to In-active this sound?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.userActiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to active this user?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.userInactiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to In-active this user?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.tutorialActiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to active this tutorial?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.tutorialInactiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to In-active this tutorial?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});


$('input.form-control').change(function() {
    $(this).val($(this).val().trim());
});

//plans
$(document).on('click', '.plansActiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to active this plan?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.plansInactiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to In-active this plan?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
// reward
$(document).on('click', '.rewardActiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to active this reward?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});
$(document).on('click', '.rewardInactiveStatus', function (e) {
    e.preventDefault();
    const url = $(this).attr('href');
    Swal.fire({
        title: 'Are you sure you want to In-active this reward?',
        type: 'warning',
        showCancelButton: !0,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
    }).then(function (t) {
        t.value &&  (window.location.href = url);
    });
});