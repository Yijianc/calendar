/**
 * Created by Boyce on 2016/4/14.
 */
$('.tab-list').each(function () {
    var $this = $(this),
        $tab = $this.find('li.selected'),
        $link = $tab.find('a'),
        $panel = $($link.attr('href'));

    $this.on('click', '.tab-control', function (e) {
        e.preventDefault();
        var $link = $(this),
            id = this.hash;

        if (id && !$link.is('.selected')) {
            $panel.removeClass('selected');
            $tab.removeClass('selected');

            $panel = $(id).addClass('selected');
            $tab = $link.parent().addClass('selected');
        }
    })
});