$(document).ready(function() {
//private pagination
    $(function(){
        itemsPerPage = 4;
        paginatorStyle = 3;
        paginatorPosition = 'bottom';
        enableGoToPage = false;
    
        $(".side_calendar_list").pagination();
        
    });
//login modal
    $('.bt-member-login').click(function(e) {
        e.preventDefault();
        if ($.cookie('LOGIN%5FKEY')) {
            window.location = "/club/scripts/mylocker/mylocker.asp?NS=MYLOCKER";
        } else {
            $('.memberLogin').fadeIn('fast');
            $('.closeLogin').fadeIn('fast');
        }
    });
    $('.closeLogin,.closeButton').click(function() {
        $('.memberLogin').fadeOut('fast');
        $('.closeLogin').fadeOut('fast');
    });
//Fix Left Nav 2 Lines
    $(".sidebar-nav li a").each(function() {
        if ($(this).height() > 30) {
            $(this).addClass("two-lines");
        }
    });
//full width announcement - above content and sidebar
    $(".main .private-announcements.full").prependTo($(".welcome-back"));
//Fix Calendar
    var page_title = $("html.club_scripts_calendar_weekly_calendar .content-right h1");
    page_title.text(page_title.text().replace("Club ",""));
    $("html.club_scripts_calendar_weekly_calendar .cal_frmMain a.cal_back_link").html("&laquo; Back");
    $("html.club_scripts_calendar_weekly_calendar .cal_frmMain a.cal_next_link").html("Next &raquo;");
//Get rid of h2  if if is the same as h1 for club person page
    var counth2 = $(".club_scripts_clubpers_view_clubpers_list h2.clubDepartment");
    if( counth2.length < 2){
        counth2.hide();
    }
$(' .place:nth-of-type(2n)').addClass('endRow');
    var dbox = $('.description').clone();
    $('.place:nth-of-type(2n)').after(dbox);
    $(' .place:last-of-type').after(dbox);
    $(' .place').click(function(){
        _this = $(this);
        $('.place').removeClass('active');
        var nextDbox = _this.nextAll('.description:first');
        $('.description').stop(true,true).slideUp(200);
        setTimeout(function(){
            var name = _this.find('p.name').text();
            var content = _this.find('.placesModal').html();
            nextDbox.find('h2').html(name);
            nextDbox.find('.boxContent').html(content);
            if(nextDbox.attr('data-name') != name) {
                _this.addClass('active');
                _this.nextAll('.description:first').stop(true,true).slideDown(200);
                nextDbox.attr('data-name',name);
            } else{
                nextDbox.attr('data-name','');
            }
        },200);
    })

    $('a.fancybox').fancybox();
    function mathStuffs() {
        $('.homepage .masthead').height($(window).height());
        var pW = $('.cycle-pager').children().length * 24;
        $('.controls').css('margin-left','-'+((pW/2)+47.5)+'px');
    }
    mathStuffs();
    $(window).resize(mathStuffs);

    if($('.btn_links.facilitiesButtons').children().length < 1){
        $('.btn_links.facilitiesButtons').remove();
    }
    $('.homepage .day_desc a').each(function(){
        var newHref=$(this).attr('href').split('NS=')[0] +'NS=PUBLIC';
        $(this).attr('href',newHref);
    })
});

