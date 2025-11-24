import { PostGeneratorForm } from "@/components/generator/post-generator-form";
import { GenerationHistory } from "@/components/generator/generation-history";

export default function Home() {
  return (
    <div className=" ">
      <div className="">
        {/* Generator Form */}
        <PostGeneratorForm />

        {/* Generation History */}
        <div id="history" className="border-t py-20">
          <div className="max-w-4xl mx-auto">
            {" "}
            <GenerationHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
