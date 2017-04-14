/**
 * Created by kip on 3/25/17.
 */


import play.mvc.EssentialFilter;
import play.filters.cors.CORSFilter;
import play.http.DefaultHttpFilters;

import javax.inject.Inject;

public class Filters extends DefaultHttpFilters {
    @Inject public Filters(CORSFilter corsFilter) {
        super(corsFilter);
    }
}
