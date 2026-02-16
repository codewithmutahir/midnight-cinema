import { HeroSlider } from "@/components/HeroSlider";
import { MovieRow } from "@/components/MovieRow";
import { MoodBar } from "@/components/MoodBar";
import { DailyRoulette } from "@/components/DailyRoulette";
import { WatchTogetherBanner } from "@/components/WatchTogetherBanner";
import { BecauseYouWatched } from "@/components/BecauseYouWatched";
import {
  fetchTrendingMovies,
  fetchTrendingTV,
  fetchTopRatedMovies,
  fetchTopRatedTV,
  fetchMoviesByGenre,
  fetchDiscoverMovies,
  fetchIndianMovies,
} from "@/lib/tmdb";
import { TVRow } from "@/components/TVRow";
import { RecentlyWatched } from "@/components/RecentlyWatched";

const ROW_SIZE = 12;

/** Themed collections for Midnight Picks (editorial voice). */
const MIDNIGHT_PICKS = [
  { title: "Under 90 minutes", subtitle: "Quick watches", params: { "with_runtime.lte": 90 } },
  { title: "Date night", subtitle: "Romance & comedy", params: { with_genres: 10749 } }, // Romance
  { title: "Mind benders", subtitle: "Thrillers & sci-fi", params: { with_genres: 53 } }, // Thriller
];

export const revalidate = 3600;

export default async function HomePage() {
  const [
    trendingRes,
    trendingTVRes,
    topRatedTVRes,
    topRatedRes,
    actionRes,
    dramaRes,
    horrorRes,
    picksUnder90,
    picksDateNight,
    picksMindBenders,
    indianPopularRes,
  ] = await Promise.all([
    fetchTrendingMovies(1, "week").catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchTrendingMovies>>["results"] })),
    fetchTrendingTV(1, "week").catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchTrendingTV>>["results"] })),
    fetchTopRatedTV(1).catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchTopRatedTV>>["results"] })),
    fetchTopRatedMovies(1).catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchTopRatedMovies>>["results"] })),
    fetchMoviesByGenre(28, 1).catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchMoviesByGenre>>["results"] })),
    fetchMoviesByGenre(18, 1).catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchMoviesByGenre>>["results"] })),
    fetchMoviesByGenre(27, 1).catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchMoviesByGenre>>["results"] })),
    fetchDiscoverMovies({ "with_runtime.lte": 90 }).catch(() => ({ results: [] })),
    fetchDiscoverMovies({ with_genres: 10749 }).catch(() => ({ results: [] })),
    fetchDiscoverMovies({ with_genres: 53 }).catch(() => ({ results: [] })),
    fetchIndianMovies(1).catch(() => ({ results: [] as Awaited<ReturnType<typeof fetchIndianMovies>>["results"] })),
  ]);

  const heroSlides = trendingRes.results.slice(0, 5);
  const trendingRest = trendingRes.results.slice(5, 5 + ROW_SIZE);
  const trendingTV = trendingTVRes.results.slice(0, ROW_SIZE);
  const topRatedTV = topRatedTVRes.results.slice(0, ROW_SIZE);
  const topRated = topRatedRes.results.slice(0, ROW_SIZE);
  const genreRows = [
    { title: "Action", results: actionRes.results.slice(0, ROW_SIZE), id: 28 },
    { title: "Drama", results: dramaRes.results.slice(0, ROW_SIZE), id: 18 },
    { title: "Horror", results: horrorRes.results.slice(0, ROW_SIZE), id: 27 },
  ];
  const indianPopular = (indianPopularRes?.results ?? []).slice(0, ROW_SIZE);
  const midnightPicksRows = [
    { title: MIDNIGHT_PICKS[0].title, subtitle: MIDNIGHT_PICKS[0].subtitle, results: picksUnder90.results.slice(0, ROW_SIZE) },
    { title: MIDNIGHT_PICKS[1].title, subtitle: MIDNIGHT_PICKS[1].subtitle, results: picksDateNight.results.slice(0, ROW_SIZE) },
    { title: MIDNIGHT_PICKS[2].title, subtitle: MIDNIGHT_PICKS[2].subtitle, results: picksMindBenders.results.slice(0, ROW_SIZE) },
  ];

  return (
    <div className="flex flex-col">
      {heroSlides.length > 0 && <HeroSlider movies={heroSlides} />}

      <MoodBar />

      <DailyRoulette />

      <div className="space-y-10 py-10 sm:space-y-12 sm:py-12">
        <RecentlyWatched />
        <BecauseYouWatched />
        {trendingRest.length > 0 && (
          <MovieRow
            title="Trending this week"
            movies={trendingRest}
            ariaLabel="Trending movies"
          />
        )}

        {topRated.length > 0 && (
          <MovieRow
            title="Top rated"
            movies={topRated}
            ariaLabel="Top rated movies"
          />
        )}

        {trendingTV.length > 0 && (
          <TVRow
            title="Trending TV this week"
            shows={trendingTV}
            ariaLabel="Trending TV shows"
          />
        )}

        {topRatedTV.length > 0 && (
          <TVRow
            title="Top rated TV"
            shows={topRatedTV}
            ariaLabel="Top rated TV shows"
          />
        )}

        {midnightPicksRows.some((r) => r.results.length > 0) && (
          <>
            <div className="px-4 sm:px-6 lg:px-8">
              <h2 className="font-display text-2xl tracking-wide text-[var(--text-primary)] sm:text-3xl">
                Midnight Picks
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Curated themes for every mood</p>
            </div>
            {midnightPicksRows.map(
              (row) =>
                row.results.length > 0 && (
                  <MovieRow
                    key={row.title}
                    title={row.title}
                    movies={row.results}
                    ariaLabel={row.title}
                  />
                )
            )}
          </>
        )}

        {genreRows.map((row) =>
          row.results.length > 0 ? (
            <MovieRow
              key={row.id}
              title={row.title}
              movies={row.results}
              seeAllHref={`/genre/${row.id}`}
              ariaLabel={`${row.title} movies`}
            />
          ) : null
        )}

        {indianPopular.length > 0 && (
          <>
            <div className="px-4 sm:px-6 lg:px-8">
            </div>
            <MovieRow
              title="Popular Indian movies"
              movies={indianPopular}
              seeAllHref="/indian"
              ariaLabel="Popular Indian movies"
            />
          </>
        )}
      </div>

      <WatchTogetherBanner />

      {heroSlides.length === 0 && trendingRest.length === 0 && topRated.length === 0 && (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <p className="text-[var(--text-muted)]">
            Unable to load movies. Ensure TMDB_API_KEY is set in .env
          </p>
        </div>
      )}
    </div>
  );
}
