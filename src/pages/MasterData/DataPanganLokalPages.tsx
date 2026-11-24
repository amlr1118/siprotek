import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import DataPanganLokalComponent from "../../components/master-data/DataPanganLokalComponent";

export default function JadwalKegiatanPages() {
  return (
    <>
      <PageMeta title="Master Data | Data Pangan Lokal" description="" />
      <PageBreadcrumb pageTitle="Data Peserta Prolnais" />
      <div className="space-y-6">
        <ComponentCard title="">
          <DataPanganLokalComponent />
        </ComponentCard>
      </div>
    </>
  );
}
