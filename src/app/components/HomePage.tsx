import Link from "next/link";
import Header from "./Header"

const HomePage = () => {
  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      {/*Header*/}
      <Header />

      {/*Main Content*/}
      <div className="bg-primary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <div className="border-b-2 h-auto border-primary rounded-xl">
          <div className="flex-row flex">
            <h1 className="font-bold text-xl pb-4 ml-4">Recent Activity</h1>
          </div>
        </div>

        {/*SubContent 1*/}
        <div className="flex-col py-4">
          <div className="my-4 inline-flex w-full border-b-1 border-white">
            <div className="w-10 h-10 bg-slate-500 rounded-xl mx-4"></div>
            <div className="flex-col ml-16">
              <p>
               <Link className="font-bold" href="/">Riley</Link> added to her <Link className="font-bold" href="/">Dog Movie</Link> snack. 
              </p>
              <p>{new Date().toISOString()}</p>
            </div>
          </div>
          <div className="my-4 inline-flex w-full border-1 border-white">
            <div className="w-10 h-10 bg-slate-500 rounded-xl mx-4"></div>
            <div className="flex-col ml-16">
              <p>
                <Link className="font-bold" href="/">Sarah</Link> said she&apos;s listening to <Link className="font-bold" href="/">Styx</Link>.
              </p>
              <p>{new Date().toISOString()}</p>
            </div>
          </div>
          <div className="my-4 inline-flex w-full border-1 border-white">
            <div className="w-10 h-10 bg-slate-500 rounded-xl mx-4"></div>
            <div className="flex-col ml-16">
              <p>
                <Link className="font-bold" href="/">Riley</Link> added to her <Link className="font-bold" href="/">Dog Movies</Link> snack. 
              </p>
              <p>{new Date().toISOString()}</p>
            </div>
          </div>
          <div className="my-4 inline-flex w-full border-1 border-white">
            <div className="w-10 h-10 bg-slate-500 rounded-xl mx-4"></div>
            <div className="flex-col ml-16">
              <p>
                <Link className="font-bold" href="/">Sarah</Link> said she&apos;s listening to <Link className="font-bold" href="/">Styx</Link>.
              </p>
              <p>{new Date().toISOString()}</p>
            </div>
          </div>
          <div className="my-4 inline-flex w-full border-1 border-white">
            <div className="w-10 h-10 bg-slate-500 rounded-xl mx-4"></div>
            <div className="flex-col ml-16">
              <p>
               <Link className="font-bold" href="/">Riley</Link> added to her <Link className="font-bold" href="/">Dog Movie</Link> snack. 
              </p>
              <p>{new Date().toISOString()}</p>
            </div>
          </div>
          <div className="my-4 inline-flex w-full border-1 border-white">
            <div className="w-10 h-10 bg-slate-500 rounded-xl mx-4"></div>
            <div className="flex-col ml-16">
              <p>
                <Link className="font-bold" href="/">Sarah</Link> said she&apos;s listening to <Link className="font-bold" href="/">Styx</Link>.
              </p>
              <p>{new Date().toISOString()}</p>
            </div>
          </div>
          <div className="my-4 inline-flex w-full border-1 border-white">
            <div className="w-10 h-10 bg-slate-500 rounded-xl mx-4"></div>
            <div className="flex-col ml-16">
              <p>
                <Link className="font-bold" href="/">Riley</Link> added to her <Link className="font-bold" href="/">Dog Movie</Link> snack. 
              </p>
              <p>{new Date().toISOString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
